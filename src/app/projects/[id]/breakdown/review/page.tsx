import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { eq, and, asc } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  breakdownJob,
  project,
  projectMember,
  projectModule,
  projectMilestone,
  projectTask,
  user,
} from "@/db/schema";
import { BreakdownReviewShell } from "./BreakdownReviewShell";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  const [proj] = await db
    .select({ title: project.title })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  return {
    title: proj ? `AI Breakdown — ${proj.title} | Paceup` : "AI Breakdown | Paceup",
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function BreakdownReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;

  // ── Auth guard ──────────────────────────────────────────────────────────────
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    redirect(`/login?returnTo=/projects/${projectId}/breakdown/review`);
  }
  const userId = session.user.id;

  // ── Membership check ───────────────────────────────────────────────────────
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
    redirect("/projects");
  }

  // ── Confirm breakdown is complete ──────────────────────────────────────────
  // If someone navigates here directly but the job isn't done yet, send them back.
  const [job] = await db
    .select({ status: breakdownJob.status })
    .from(breakdownJob)
    .where(eq(breakdownJob.projectId, projectId))
    .limit(1);

  if (!job || job.status === "pending" || job.status === "running") {
    redirect(`/projects/${projectId}/breakdown`);
  }

  // ── Fetch all data in parallel ─────────────────────────────────────────────

  const [projectData, rawModules, rawMilestones, rawTasks, rawMembers] =
    await Promise.all([
      // Project info
      db
        .select({ title: project.title, deadline: project.deadline })
        .from(project)
        .where(eq(project.id, projectId))
        .limit(1),

      // Modules ordered by position
      db
        .select({
          id: projectModule.id,
          name: projectModule.name,
          description: projectModule.description,
          order: projectModule.order,
        })
        .from(projectModule)
        .where(eq(projectModule.projectId, projectId))
        .orderBy(asc(projectModule.order)),

      // Milestones ordered by position
      db
        .select({
          id: projectMilestone.id,
          name: projectMilestone.name,
          description: projectMilestone.description,
          dueDate: projectMilestone.dueDate,
          order: projectMilestone.order,
        })
        .from(projectMilestone)
        .where(eq(projectMilestone.projectId, projectId))
        .orderBy(asc(projectMilestone.order)),

      // Tasks joined to user for assignee display
      // Index used: project_task_project_idx
      db
        .select({
          id: projectTask.id,
          moduleId: projectTask.moduleId,
          name: projectTask.name,
          description: projectTask.description,
          effortHours: projectTask.effortHours,
          assigneeId: projectTask.assigneeId,
          aiRationale: projectTask.aiRationale,
          lowConfidence: projectTask.lowConfidence,
          lowConfidenceNote: projectTask.lowConfidenceNote,
          humanOverride: projectTask.humanOverride,
          order: projectTask.order,
          // Assignee fields — null if task is unassigned
          assigneeName: user.name,
          assigneeImage: user.image,
        })
        .from(projectTask)
        .leftJoin(user, eq(projectTask.assigneeId, user.id))
        .where(eq(projectTask.projectId, projectId))
        .orderBy(asc(projectTask.order)),

      // All project members joined to user for workload strip
      db
        .select({
          userId: projectMember.userId,
          name: user.name,
          image: user.image,
        })
        .from(projectMember)
        .innerJoin(user, eq(projectMember.userId, user.id))
        .where(eq(projectMember.projectId, projectId)),
    ]);

  if (!projectData[0]) {
    redirect("/projects");
  }

  // ── Build workload map ─────────────────────────────────────────────────────
  // Map userId → total assigned effort hours
  const hoursMap = new Map<string, number>();
  for (const task of rawTasks) {
    if (task.assigneeId && task.effortHours) {
      hoursMap.set(
        task.assigneeId,
        (hoursMap.get(task.assigneeId) ?? 0) + task.effortHours
      );
    }
  }

  const workload = rawMembers.map((m) => ({
    userId: m.userId,
    name: m.name,
    image: m.image,
    totalHours: hoursMap.get(m.userId) ?? 0,
  }));

  // ── Build modules-with-tasks structure ─────────────────────────────────────
  const tasksByModule = new Map<string, typeof rawTasks>();
  for (const task of rawTasks) {
    const existing = tasksByModule.get(task.moduleId) ?? [];
    existing.push(task);
    tasksByModule.set(task.moduleId, existing);
  }

  const modules = rawModules.map((mod) => {
    const tasks = (tasksByModule.get(mod.id) ?? []).map((t) => ({
      id: t.id,
      name: t.name,
      description: t.description,
      effortHours: t.effortHours,
      assigneeId: t.assigneeId,
      assignee:
        t.assigneeId && t.assigneeName
          ? { name: t.assigneeName, image: t.assigneeImage ?? null }
          : null,
      aiRationale: t.aiRationale,
      lowConfidence: t.lowConfidence,
      lowConfidenceNote: t.lowConfidenceNote,
      humanOverride: t.humanOverride,
      order: t.order,
    }));

    return {
      id: mod.id,
      name: mod.name,
      description: mod.description,
      taskCount: tasks.length,
      tasks,
    };
  });

  const allMembers = rawMembers.map((m) => ({
    userId: m.userId,
    name: m.name,
    image: m.image,
  }));

  return (
    <BreakdownReviewShell
      projectId={projectId}
      projectTitle={projectData[0].title}
      projectDeadline={projectData[0].deadline ?? null}
      modules={modules}
      milestones={rawMilestones.map((ms) => ({
        id: ms.id,
        name: ms.name,
        description: ms.description,
        dueDate: ms.dueDate,
        order: ms.order,
      }))}
      workload={workload}
      allMembers={allMembers}
    />
  );
}
