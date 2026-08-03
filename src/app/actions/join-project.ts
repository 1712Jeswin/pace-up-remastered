"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { projectMember, projectInvite } from "@/db/schema";
import { nanoid } from "nanoid";
import type { JoinProjectFormData, SkillEntry } from "@/types/join";

// ─── Types ────────────────────────────────────────────────────────────────────

export type JoinProjectResult =
  | { success: true; projectId: string }
  | { success: false; error: string };

// ─── Validation ───────────────────────────────────────────────────────────────

function validateProfile(data: JoinProjectFormData): string | null {
  // rolePreference is effectively required by the UI but technically optional in the DB
  // Weekly hours must be a non-negative integer
  if (data.weeklyHours < 0 || data.weeklyHours > 40) {
    return "Weekly hours must be between 0 and 40.";
  }
  return null;
}

// ─── Action ───────────────────────────────────────────────────────────────────

/**
 * Finalises a user's project membership after they complete the profile setup flow.
 *
 * Validates:
 *   1. User is authenticated (session-derived identity, never client-supplied).
 *   2. The invite token is pending, not expired, and belongs to this user and project.
 *
 * Writes (single Drizzle transaction):
 *   - Inserts a `projectMember` row with all collected profile fields.
 *   - Updates the `projectInvite` status to `"accepted"`.
 *
 * Returns the projectId so the client can redirect to the project dashboard.
 */
export async function joinProjectAction(
  projectId: string,
  inviteToken: string,
  profileData: JoinProjectFormData
): Promise<JoinProjectResult> {
  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  // ── Input validation ───────────────────────────────────────────────────────
  if (!projectId.trim()) {
    return { success: false, error: "Invalid project ID." };
  }
  if (!inviteToken.trim()) {
    return { success: false, error: "Invalid invite token." };
  }

  const profileError = validateProfile(profileData);
  if (profileError) {
    return { success: false, error: profileError };
  }

  try {
    // ── Fetch the invite ─────────────────────────────────────────────────────
    // Verify: token exists, belongs to this project, is pending, and is not expired.
    // We also confirm `inviteeId` matches the authenticated user — never trust
    // a client-supplied user ID for permission checks.
    const [invite] = await db
      .select({
        id: projectInvite.id,
        inviteeId: projectInvite.inviteeId,
        status: projectInvite.status,
        expiresAt: projectInvite.expiresAt,
      })
      .from(projectInvite)
      .where(
        and(
          eq(projectInvite.token, inviteToken),
          eq(projectInvite.projectId, projectId)
        )
      )
      .limit(1);

    if (!invite) {
      return { success: false, error: "Invite not found or has already been used." };
    }

    // The invite may be link-based (inviteeId is null until claimed) or handle-based
    // (inviteeId is set to a specific user). In both cases we confirm ownership here.
    if (invite.inviteeId !== null && invite.inviteeId !== userId) {
      return { success: false, error: "This invite was sent to a different account." };
    }

    if (invite.status !== "pending") {
      return { success: false, error: "This invite has already been accepted or declined." };
    }

    if (new Date() > invite.expiresAt) {
      return { success: false, error: "This invite has expired. Ask the project owner to send a new one." };
    }

    // ── Transaction: insert member + mark invite accepted ─────────────────────
    const now = new Date();

    // Cast skills to the exact union type expected by the schema
    const skills = (profileData.skills ?? []) as {
      name: string;
      confidence: "Comfortable" | "Learning";
    }[];

    await db.batch([
      db.insert(projectMember).values({
        id: nanoid(),
        projectId,
        userId,
        role: "member",
        skills: skills.length > 0 ? skills : null,
        rolePreference:
          (profileData.rolePreference as SkillEntry["confidence"] | undefined)
            ? (profileData.rolePreference as
                | "Frontend"
                | "Backend"
                | "Design"
                | "Research"
                | "PM-ish"
                | "Flexible")
            : undefined,
        interests: profileData.interests || null,
        weeklyHours: profileData.weeklyHours,
        otherProjects: profileData.otherProjects,
        timezone: profileData.timezone || null,
        resumeSummary: profileData.resumeSummary || null,
        resumeStoragePath: profileData.resumeStoragePath || null,
        joinedAt: now,
      }),

      db
        .update(projectInvite)
        .set({ status: "accepted" })
        .where(eq(projectInvite.id, invite.id)),
    ]);

    return { success: true, projectId };
  } catch (err) {
    // Never expose raw DB errors to the client
    console.error("[joinProjectAction] Transaction failed:", err);
    return { success: false, error: "Failed to join the project. Please try again." };
  }
}
