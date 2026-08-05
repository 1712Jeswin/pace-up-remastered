"use server";

import { headers } from "next/headers";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { standupCheckin, projectMember } from "@/db/schema";

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns today's UTC date as a YYYY-MM-DD string.
 * All standup date comparisons use UTC to avoid timezone drift.
 */
function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

// ─── submitCheckinAction ───────────────────────────────────────────────────────

interface SubmitCheckinParams {
  projectId: string;
  /** What the member is working on today (required, max 500 chars) */
  update: string;
  /** Optional blocker note (max 300 chars) */
  blockers?: string;
}

export type SubmitCheckinResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Submits a daily standup check-in for the authenticated user.
 *
 * Security:
 * - Derives userId from server-side session — never trusts client-supplied identity.
 * - Verifies the user is a member of the project before inserting.
 * - Enforces one check-in per person per day via the DB unique constraint.
 */
export async function submitCheckinAction(
  params: SubmitCheckinParams
): Promise<SubmitCheckinResult> {
  const { projectId, update, blockers } = params;

  // ── Auth ───────────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  // ── Input validation ───────────────────────────────────────────────────────
  const trimmedUpdate = update.trim();
  if (!trimmedUpdate) {
    return { success: false, error: "Check-in update cannot be empty." };
  }
  if (trimmedUpdate.length > 500) {
    return { success: false, error: "Update must be 500 characters or fewer." };
  }
  const trimmedBlockers = blockers?.trim() || null;
  if (trimmedBlockers && trimmedBlockers.length > 300) {
    return { success: false, error: "Blockers note must be 300 characters or fewer." };
  }

  try {
    // ── Authorisation — user must be a project member ──────────────────────
    const [membership] = await db
      .select({ id: projectMember.id })
      .from(projectMember)
      .where(
        and(
          eq(projectMember.projectId, projectId),
          eq(projectMember.userId, userId)
        )
      )
      .limit(1);

    if (!membership) {
      return { success: false, error: "You are not a member of this project." };
    }

    const today = getTodayUtc();

    // ── Insert (unique constraint prevents double check-ins) ───────────────
    await db.insert(standupCheckin).values({
      id: nanoid(),
      projectId,
      userId,
      date: today,
      update: trimmedUpdate,
      blockers: trimmedBlockers,
      createdAt: new Date(),
    });

    return { success: true };
  } catch (err) {
    // DB unique constraint violation means already checked in
    if (err instanceof Error && err.message.includes("unique")) {
      return { success: false, error: "You've already checked in today." };
    }
    const message = err instanceof Error ? err.message : "Failed to submit check-in.";
    console.error("[submitCheckinAction] Error:", message);
    return { success: false, error: message };
  }
}
