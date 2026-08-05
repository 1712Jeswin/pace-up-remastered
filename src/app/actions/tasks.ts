"use server";

import { db } from "@/lib/db";
import { projectTask, projectActivity } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";

export type TaskStatus = "not_started" | "in_progress" | "in_review" | "complete" | "blocked";

export async function updateTaskStatusAction(
  projectId: string,
  taskId: string,
  newStatus: TaskStatus
) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const userId = session.user.id;

    // We don't have db.transaction working perfectly in Neon-HTTP, so we use sequential updates
    // Update the task status
    const updatedTasks = await db
      .update(projectTask)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(and(eq(projectTask.id, taskId), eq(projectTask.projectId, projectId)))
      .returning();

    if (!updatedTasks.length) {
      return { success: false, error: "Task not found" };
    }

    const task = updatedTasks[0];

    // If it's complete, log it to the activity feed
    if (newStatus === "complete") {
      await db.insert(projectActivity).values({
        id: randomBytes(12).toString("hex"),
        projectId,
        userId,
        type: "task_completed",
        metadata: {
          taskName: task.name,
        },
        createdAt: new Date(),
      });
    }

    // Revalidate paths so the board updates natively if needed
    revalidatePath(`/projects/${projectId}/tasks`);
    revalidatePath(`/projects/${projectId}`);

    return { success: true, data: task };
  } catch (error) {
    console.error("updateTaskStatusAction error:", error);
    return { success: false, error: "Failed to update task status" };
  }
}
