"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { eq, and } from "drizzle-orm";
import { tasks } from "@trigger.dev/sdk/v3";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  project,
  projectTask,
  projectModule,
  projectMilestone,
  breakdownJob,
  projectMember,
} from "@/db/schema";

// ─── Shared auth + ownership guard ───────────────────────────────────────────

/**
 * Validates that the requesting user is authenticated and is the owner of the project.
 * Returns the userId on success, throws on failure.
 */
async function requireProjectOwner(projectId: string): Promise<string> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    throw new Error("Not authenticated.");
  }
  const userId = session.user.id;

  const [proj] = await db
    .select({ ownerId: project.ownerId })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  if (!proj) {
    throw new Error("Project not found.");
  }
  if (proj.ownerId !== userId) {
    throw new Error("Only the project owner can modify the breakdown.");
  }

  return userId;
}

// ─── updateTaskAction ─────────────────────────────────────────────────────────

interface UpdateTaskParams {
  projectId: string;
  taskId: string;
  name?: string;
  description?: string;
  /** userId of the new assignee — null to unassign */
  assigneeUserId?: string | null;
}

export type UpdateTaskResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Updates a task's name, description, and/or assignee.
 * Sets humanOverride: true to mark it as manually adjusted.
 *
 * Security:
 * - User must be authenticated and the project owner.
 * - taskId must belong to projectId (row-level check — never trust client-supplied IDs).
 */
export async function updateTaskAction(
  params: UpdateTaskParams
): Promise<UpdateTaskResult> {
  const { projectId, taskId, name, description, assigneeUserId } = params;

  try {
    await requireProjectOwner(projectId);

    // Row-level check: confirm this task actually belongs to this project
    const [existingTask] = await db
      .select({ id: projectTask.id })
      .from(projectTask)
      .where(and(eq(projectTask.id, taskId), eq(projectTask.projectId, projectId)))
      .limit(1);

    if (!existingTask) {
      return { success: false, error: "Task not found in this project." };
    }

    // If reassigning, confirm the new assignee is a member of this project
    if (assigneeUserId !== undefined && assigneeUserId !== null) {
      const [membership] = await db
        .select({ id: projectMember.id })
        .from(projectMember)
        .where(
          and(
            eq(projectMember.projectId, projectId),
            eq(projectMember.userId, assigneeUserId)
          )
        )
        .limit(1);

      if (!membership) {
        return { success: false, error: "Assignee is not a member of this project." };
      }
    }

    // Build update payload — only include fields that were supplied
    const updatePayload: Record<string, unknown> = {
      humanOverride: true,
      updatedAt: new Date(),
    };
    if (name !== undefined) updatePayload.name = name.trim();
    if (description !== undefined) updatePayload.description = description.trim() || null;
    if (assigneeUserId !== undefined) updatePayload.assigneeId = assigneeUserId;

    await db
      .update(projectTask)
      .set(updatePayload)
      .where(eq(projectTask.id, taskId));

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to update task.";
    console.error("[updateTaskAction] Error:", message);
    return { success: false, error: message };
  }
}

// ─── regenerateBreakdownAction ────────────────────────────────────────────────

interface RegenerateParams {
  projectId: string;
  feedbackNote?: string;
}

export type RegenerateResult =
  | { success: true }
  | { success: false; error: string };

/**
 * Deletes all existing breakdown data for the project and re-triggers the AI engine.
 * Optionally includes a user feedback note that will be injected into the AI prompt.
 *
 * Security: only the project owner can regenerate.
 */
export async function regenerateBreakdownAction(
  params: RegenerateParams
): Promise<RegenerateResult> {
  const { projectId, feedbackNote } = params;

  try {
    await requireProjectOwner(projectId);

    // Validate feedbackNote length — prevents absurdly long inputs
    if (feedbackNote && feedbackNote.length > 300) {
      return { success: false, error: "Feedback note must be 300 characters or fewer." };
    }

    // Delete all existing breakdown data for this project.
    // Cascade deletes on project_module will remove project_task rows too.
    await db.batch([
      db.delete(projectModule).where(eq(projectModule.projectId, projectId)),
      db.delete(projectMilestone).where(eq(projectMilestone.projectId, projectId)),
    ]);

    // Reset the breakdown_job status and store the feedback note
    await db
      .update(breakdownJob)
      .set({
        status: "pending",
        errorMessage: null,
        feedbackNote: feedbackNote?.trim() || null,
        triggerRunId: null,
        startedAt: null,
        completedAt: null,
      })
      .where(eq(breakdownJob.projectId, projectId));

    // Re-trigger the AI job
    const run = await tasks.trigger("ai-breakdown-engine", { projectId });

    // Store the new run ID
    await db
      .update(breakdownJob)
      .set({ triggerRunId: run.id })
      .where(eq(breakdownJob.projectId, projectId));

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to regenerate breakdown.";
    console.error("[regenerateBreakdownAction] Error:", message);
    return { success: false, error: message };
  }
}

// ─── confirmBreakdownAction ───────────────────────────────────────────────────

/**
 * Confirms and locks the breakdown, then redirects to the Project Dashboard.
 * The breakdown data is already live in the task tables — no additional DB write needed.
 *
 * Security: only the project owner can confirm.
 */
export async function confirmBreakdownAction(projectId: string): Promise<void> {
  await requireProjectOwner(projectId);

  // Confirm the breakdown is actually complete before locking
  const [job] = await db
    .select({ status: breakdownJob.status })
    .from(breakdownJob)
    .where(eq(breakdownJob.projectId, projectId))
    .limit(1);

  if (!job || job.status !== "complete") {
    throw new Error("Breakdown is not yet complete.");
  }

  // Redirect server-side — cannot be spoofed by the client
  redirect(`/projects/${projectId}`);
}
