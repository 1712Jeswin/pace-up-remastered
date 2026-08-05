import { ShieldAlert } from "lucide-react";

interface BlockedTask {
  id: string;
  name: string;
  moduleName: string;
  assigneeName: string | null;
  assigneeImage: string | null;
  /** Blocker note from today's standup check-in — null if no check-in yet */
  standupBlocker: string | null;
  /** True if the milestone this task belongs to is past its due date */
  milestonePastDue: boolean;
}

interface BlockersPanelProps {
  blockedTasks: BlockedTask[];
}

export function BlockersPanel({ blockedTasks }: BlockersPanelProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <ShieldAlert className="h-4 w-4 text-amber-400" />
        <h2 className="text-base font-semibold text-foreground">Active Blockers & Risk</h2>
      </div>

      {blockedTasks.length === 0 ? (
        // Empty state
        <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 px-6 py-8 text-center">
          <ShieldAlert className="h-6 w-6 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground/60">No active blockers. Ship it! 🚀</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {blockedTasks.map((task) => {
            // Red border = genuinely critical (milestone past due)
            // Gold border = blocked but not yet escalated
            const borderClass = task.milestonePastDue
              ? "border-destructive/50 shadow-[0_0_12px_rgba(239,68,68,0.1)]"
              : "border-amber-400/40 shadow-[0_0_12px_rgba(251,191,36,0.05)]";

            return (
              <div
                key={task.id}
                className={`rounded-xl border bg-card p-4 flex flex-col gap-3 ${borderClass}`}
              >
                {/* Task name + module */}
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-foreground leading-snug truncate">
                      {task.name}
                    </p>
                    <p className="text-[10px] font-mono text-muted-foreground/60 mt-0.5">
                      {task.moduleName}
                    </p>
                  </div>

                  {/* Risk badge */}
                  {task.milestonePastDue && (
                    <span className="shrink-0 rounded-md border border-destructive/40 bg-destructive/10 px-2 py-0.5 text-[10px] font-mono text-destructive whitespace-nowrap">
                      ⚠ Milestone overdue
                    </span>
                  )}
                </div>

                {/* Assignee */}
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full border border-border/60 bg-muted overflow-hidden shrink-0 flex items-center justify-center">
                    {task.assigneeImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={task.assigneeImage}
                        alt={task.assigneeName ?? ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-[9px] font-bold text-muted-foreground">
                        {task.assigneeName?.charAt(0).toUpperCase() ?? "?"}
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {task.assigneeName ?? "Unassigned"}
                  </span>
                </div>

                {/* Standup blocker note */}
                {task.standupBlocker && (
                  <div className="rounded-lg border border-amber-400/20 bg-amber-400/5 px-3 py-2">
                    <p className="text-[10px] font-mono text-amber-400/80 mb-1">From today's standup:</p>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      &ldquo;{task.standupBlocker}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
