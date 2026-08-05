import { eq, and, asc, desc } from "drizzle-orm";
import { db } from "@/lib/db";
import {
  project,
  projectMember,
  projectTask,
  projectModule,
  projectMilestone,
  standupCheckin,
  standupSummary,
  user,
  projectActivity,
} from "@/db/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { StandupSection } from "./components/StandupSection";
import { OwnershipMap } from "./components/OwnershipMap";
import { DashboardMilestoneTimeline } from "./components/DashboardMilestoneTimeline";
import { BlockersPanel } from "./components/BlockersPanel";
import { ActivityFeed } from "./components/ActivityFeed";
import { QuickActions } from "./components/QuickActions";

/**
 * Returns today's UTC date as a YYYY-MM-DD string.
 * Matches the same helper used in the server action — keeps date comparison consistent.
 */
function getTodayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default async function ProjectDashboardPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: projectId } = await params;
  const today = getTodayUtc();
  const now = new Date();

  // Derive current user from the session — already validated in layout.tsx
  const session = await auth.api.getSession({ headers: await headers() });
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- layout guarantees auth
  const currentUserId = session!.user.id;

  // ── Parallel data fetches ─────────────────────────────────────────────────

  const [
    allMembers,
    todayCheckins,
    todaySummaryRows,
    rawTasks,
    rawMilestones,
    projectRow,
    rawActivities,
  ] = await Promise.all([
    // All project members joined to user
    // Index: project_member_project_idx
    db
      .select({
        userId: projectMember.userId,
        name: user.name,
        image: user.image,
      })
      .from(projectMember)
      .innerJoin(user, eq(projectMember.userId, user.id))
      .where(eq(projectMember.projectId, projectId))
      .orderBy(asc(projectMember.joinedAt)),

    // Today's check-ins
    // Index: standup_checkin_project_date_idx
    db
      .select({
        userId: standupCheckin.userId,
        update: standupCheckin.update,
        blockers: standupCheckin.blockers,
      })
      .from(standupCheckin)
      .where(
        and(
          eq(standupCheckin.projectId, projectId),
          eq(standupCheckin.date, today)
        )
      ),

    // Today's AI summary (null until Phase 34)
    db
      .select({ summary: standupSummary.summary })
      .from(standupSummary)
      .where(
        and(
          eq(standupSummary.projectId, projectId),
          eq(standupSummary.date, today)
        )
      )
      .limit(1),

    // All tasks joined to module + assignee user
    // Index: project_task_project_idx
    db
      .select({
        id: projectTask.id,
        name: projectTask.name,
        status: projectTask.status,
        effortHours: projectTask.effortHours,
        assigneeId: projectTask.assigneeId,
        moduleId: projectTask.moduleId,
        moduleName: projectModule.name,
        assigneeName: user.name,
        assigneeImage: user.image,
      })
      .from(projectTask)
      .innerJoin(projectModule, eq(projectTask.moduleId, projectModule.id))
      .leftJoin(user, eq(projectTask.assigneeId, user.id))
      .where(eq(projectTask.projectId, projectId))
      .orderBy(asc(projectTask.order)),

    // All milestones ordered by position
    // Index: project_milestone_project_idx
    db
      .select({
        id: projectMilestone.id,
        name: projectMilestone.name,
        description: projectMilestone.description,
        dueDate: projectMilestone.dueDate,
        order: projectMilestone.order,
        completed: projectMilestone.completed,
      })
      .from(projectMilestone)
      .where(eq(projectMilestone.projectId, projectId))
      .orderBy(asc(projectMilestone.order)),

    // Project deadline for the milestone timeline
    db
      .select({ deadline: project.deadline })
      .from(project)
      .where(eq(project.id, projectId))
      .limit(1),

    // Recent activity feed
    // Index: project_activity_project_created_idx
    db
      .select({
        id: projectActivity.id,
        type: projectActivity.type,
        userId: projectActivity.userId,
        metadata: projectActivity.metadata,
        createdAt: projectActivity.createdAt,
        actorName: user.name,
        actorImage: user.image,
      })
      .from(projectActivity)
      .leftJoin(user, eq(projectActivity.userId, user.id))
      .where(eq(projectActivity.projectId, projectId))
      .orderBy(desc(projectActivity.createdAt))
      .limit(20),
  ]);

  // ── Standup section data ──────────────────────────────────────────────────

  const checkedInUserIds = new Set(todayCheckins.map((c) => c.userId));
  const checkinByUserId = new Map(todayCheckins.map((c) => [c.userId, c]));

  const checkedIn = allMembers
    .filter((m) => checkedInUserIds.has(m.userId))
    .map((m) => ({
      userId: m.userId,
      name: m.name,
      image: m.image,
      update: checkinByUserId.get(m.userId)?.update ?? "",
      blockers: checkinByUserId.get(m.userId)?.blockers ?? null,
    }));

  const pending = allMembers
    .filter((m) => !checkedInUserIds.has(m.userId))
    .map((m) => ({ userId: m.userId, name: m.name, image: m.image }));

  // ── Ownership map data ────────────────────────────────────────────────────

  // Group tasks by assignee
  const tasksByAssignee = new Map<
    string,
    { tasks: typeof rawTasks; name: string; image: string | null }
  >();

  for (const member of allMembers) {
    tasksByAssignee.set(member.userId, {
      tasks: [],
      name: member.name,
      image: member.image,
    });
  }

  const unassignedTasks: {
    id: string;
    name: string;
    status: string;
    effortHours: number | null;
    moduleName: string;
  }[] = [];

  for (const task of rawTasks) {
    if (task.assigneeId && tasksByAssignee.has(task.assigneeId)) {
      tasksByAssignee.get(task.assigneeId)!.tasks.push(task);
    } else {
      unassignedTasks.push({
        id: task.id,
        name: task.name,
        status: task.status,
        effortHours: task.effortHours,
        moduleName: task.moduleName,
      });
    }
  }

  const ownershipMembers = allMembers.map((member) => {
    const entry = tasksByAssignee.get(member.userId);
    const tasks = entry?.tasks ?? [];
    return {
      userId: member.userId,
      name: member.name,
      image: member.image,
      tasks: tasks.map((t) => ({
        id: t.id,
        name: t.name,
        status: t.status,
        effortHours: t.effortHours,
        moduleName: t.moduleName,
      })),
      totalHours: tasks.reduce((sum, t) => sum + (t.effortHours ?? 0), 0),
    };
  });

  // ── Blockers panel data ───────────────────────────────────────────────────

  const blockedTasks = rawTasks
    .filter((t) => t.status === "blocked")
    .map((t) => {
      // Check if the assignee's standup has a blocker note today
      const standupBlocker = t.assigneeId
        ? (checkinByUserId.get(t.assigneeId)?.blockers ?? null)
        : null;

      // Determine if any milestone is past due (used for critical risk flag)
      // A task in a module past its milestone due date → red border
      const milestonePastDue = rawMilestones.some(
        (ms) => !ms.completed && ms.dueDate.getTime() < now.getTime()
      );

      return {
        id: t.id,
        name: t.name,
        moduleName: t.moduleName,
        assigneeName: t.assigneeName ?? null,
        assigneeImage: t.assigneeImage ?? null,
        standupBlocker,
        milestonePastDue,
      };
    });

  const projectDeadline = projectRow[0]?.deadline ?? null;

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-12 py-2">
      {/* Section 1 — Standup Status */}
      <StandupSection
        projectId={projectId}
        currentUserId={currentUserId}
        checkedIn={checkedIn}
        pending={pending}
        aiSummary={todaySummaryRows[0]?.summary ?? null}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div className="md:col-span-2 flex flex-col gap-12">
          {/* Section 2 — Ownership Map */}
          <OwnershipMap
            members={ownershipMembers}
            unassignedTasks={unassignedTasks}
          />

          {/* Section 3 — Milestone Timeline */}
          <DashboardMilestoneTimeline
            milestones={rawMilestones}
            projectDeadline={projectDeadline}
          />

          {/* Section 4 — Blockers & Risk */}
          <BlockersPanel blockedTasks={blockedTasks} />
        </div>

        <div className="flex flex-col gap-12">
          {/* Section 5 — Quick Actions */}
          <QuickActions projectId={projectId} />

          {/* Section 6 — Activity Feed */}
          <ActivityFeed activities={rawActivities} />
        </div>
      </div>
    </div>
  );
}
