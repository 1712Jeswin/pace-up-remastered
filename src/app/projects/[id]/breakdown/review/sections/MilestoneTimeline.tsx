interface Milestone {
  id: string;
  name: string;
  description: string | null;
  dueDate: Date;
  order: number;
}

interface MilestoneTimelineProps {
  milestones: Milestone[];
  projectDeadline: Date | null;
}

export function MilestoneTimeline({ milestones, projectDeadline }: MilestoneTimelineProps) {
  const now = new Date();
  const sorted = [...milestones].sort((a, b) => a.order - b.order);
  const end = projectDeadline ?? sorted[sorted.length - 1]?.dueDate ?? now;

  // Total span in ms — used to calculate position percentages
  const spanMs = end.getTime() - now.getTime();

  function getPct(date: Date): number {
    if (spanMs <= 0) return 100;
    return Math.min(100, Math.max(0, ((date.getTime() - now.getTime()) / spanMs) * 100));
  }

  function formatDate(date: Date): string {
    return date.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
  }

  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Milestone Timeline</h2>
      <div className="rounded-xl border border-border/50 bg-card p-5">
        {/* Timeline track */}
        <div className="relative pt-8 pb-10">
          {/* Track line */}
          <div className="absolute top-1/2 left-0 right-0 h-px bg-border/60 -translate-y-1/2" />

          {/* "Today" marker */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-0.5">
            <div className="h-3 w-3 rounded-full bg-toxic border-2 border-background shadow-[0_0_8px_rgba(57,255,20,0.6)]" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[10px] font-mono text-toxic whitespace-nowrap">
              Today
            </span>
          </div>

          {/* Deadline marker */}
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-0.5">
            <div className="h-3 w-3 rounded-full bg-muted-foreground/40 border-2 border-background" />
            <span className="absolute top-full left-1/2 -translate-x-1/2 mt-2 text-[10px] font-mono text-muted-foreground/60 whitespace-nowrap">
              {projectDeadline ? formatDate(projectDeadline) : "Deadline"}
            </span>
          </div>

          {/* Milestone dots */}
          {sorted.map((ms, idx) => {
            const pct = getPct(ms.dueDate);
            const isAbove = idx % 2 === 0; // Alternate labels above/below to reduce overlap

            return (
              <div
                key={ms.id}
                className="absolute top-1/2 -translate-y-1/2"
                style={{ left: `${pct}%` }}
              >
                {/* Dot */}
                <div className="h-4 w-4 rounded-full bg-card border-2 border-toxic/60 -translate-x-1/2 shadow-sm" />

                {/* Label — alternates above/below */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 w-28 text-center ${
                    isAbove ? "bottom-full mb-3" : "top-full mt-3"
                  }`}
                >
                  <p className="text-[10px] font-semibold text-foreground leading-tight line-clamp-2">
                    {ms.name}
                  </p>
                  <p className="text-[10px] font-mono text-muted-foreground/70 mt-0.5">
                    {formatDate(ms.dueDate)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
