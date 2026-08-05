import { MilestoneTimeline } from "@/app/projects/[id]/breakdown/review/sections/MilestoneTimeline";

interface DashboardMilestone {
  id: string;
  name: string;
  description: string | null;
  dueDate: Date;
  order: number;
  completed: boolean;
}

interface DashboardMilestoneTimelineProps {
  milestones: DashboardMilestone[];
  projectDeadline: Date | null;
}

/**
 * Thin dashboard wrapper around the shared MilestoneTimeline component.
 * Passes the `completed` field so the dashboard view shows distinct states
 * for completed, current, and upcoming milestones.
 */
export function DashboardMilestoneTimeline({
  milestones,
  projectDeadline,
}: DashboardMilestoneTimelineProps) {
  if (milestones.length === 0) return null;

  return (
    <MilestoneTimeline
      milestones={milestones}
      projectDeadline={projectDeadline}
    />
  );
}
