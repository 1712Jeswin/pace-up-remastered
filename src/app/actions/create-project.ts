"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { project, projectMember, projectInvite, projectApiKey } from "@/db/schema";
import { nanoid } from "nanoid";
import type { WizardFormData } from "@/types/wizard";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CreateProjectResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

// ─── Validation ───────────────────────────────────────────────────────────────

function validateFormData(data: WizardFormData): string | null {
  if (!data.title.trim()) return "Project title is required.";
  if (!data.type) return "Project type is required.";
  if (!data.deadline) return "Project deadline is required.";

  // Guard: deadline must be in the future
  const deadline = new Date(data.deadline);
  if (isNaN(deadline.getTime())) return "Invalid deadline date.";

  return null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Persists the entire wizard state to the database as a new project.
 * All writes are inside a single Drizzle transaction — either everything
 * succeeds or nothing is committed.
 *
 * After a successful commit, enqueues the AI Breakdown Engine job via Trigger.dev.
 * Returns the new project ID on success so the client can redirect.
 */
export async function createProjectAction(
  formData: WizardFormData
): Promise<CreateProjectResult> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const ownerId = session.user.id;

  // ── Server-side validation ─────────────────────────────────────────────────
  const validationError = validateFormData(formData);
  if (validationError) {
    return { success: false, error: validationError };
  }

  const now = new Date();
  const projectId = nanoid();
  const deadline = new Date(formData.deadline);

  try {
    await db.transaction(async (tx) => {
      // ── 1. Create the project ────────────────────────────────────────────
      await tx.insert(project).values({
        id: projectId,
        title: formData.title.trim(),
        type: formData.type as "Hackathon" | "Final-Year Project" | "Coursework" | "Club Project" | "Research",
        progress: 0,
        deadline,
        archivedAt: null,
        lastActiveAt: now,
        ownerId,
        createdAt: now,
        updatedAt: now,
      });

      // ── 2. Add the creator as owner-member ───────────────────────────────
      await tx.insert(projectMember).values({
        id: nanoid(),
        projectId,
        userId: ownerId,
        role: "owner",
        joinedAt: now,
      });

      // ── 3. Create pending invites for all staged invites ─────────────────
      // Invite expiry: 7 days from now
      const inviteExpiresAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

      for (const invite of formData.stagedInvites) {
        await tx.insert(projectInvite).values({
          id: nanoid(),
          projectId,
          inviteeId: invite.userId,
          invitedByUserId: ownerId,
          code: null,
          token: nanoid(32),
          status: "pending",
          expiresAt: inviteExpiresAt,
          createdAt: now,
        });
      }

      // ── 4. Store the encrypted API key (if one was saved) ────────────────
      if (formData.providerKey?.isSaved && formData.providerKey.encryptedKey) {
        const { provider, encryptedKey, policy } = formData.providerKey;

        if (provider) {
          await tx.insert(projectApiKey).values({
            id: nanoid(),
            projectId,
            userId: ownerId,
            provider: provider as "gemini" | "openai" | "anthropic" | "openrouter" | "groq",
            encryptedKey,
            policy: policy as "owner_key" | "per_member_key",
            createdAt: now,
            updatedAt: now,
          });
        }
      }
    });

    // ── 5. Enqueue AI Breakdown Engine (Phase 22) ────────────────────────────
    // TODO: [Phase 22] Uncomment when the Trigger.dev task exists:
    //
    // await tasks.trigger("ai-breakdown-engine", {
    //   projectId,
    //   title: formData.title,
    //   techStack: formData.techStack,
    //   problemStatement: formData.problemStatement,
    //   solution: formData.solution,
    //   scope: formData.scope,
    //   documentUrls: formData.uploadedDocuments.map((d) => d.url),
    // });

    return { success: true, projectId };
  } catch (err) {
    // Catch all DB errors — never expose raw Prisma/Drizzle errors to the client
    console.error("[createProjectAction] Transaction failed:", err);
    return {
      success: false,
      error: "Failed to create the project. Please try again.",
    };
  }
}
