interface Task {
  id: string;
  name: string;
  status: string;
  effortHours: number | null;
  moduleName: string;
}

interface MemberWithTasks {
  userId: string;
  name: string;
  image: string | null;
  tasks: Task[];
  totalHours: number;
}

interface OwnershipMapProps {
  members: MemberWithTasks[];
  unassignedTasks: Task[];
}

// Maximum task chips to show per row before truncating
const MAX_VISIBLE_TASKS = 5;

function statusDotColor(status: string): string {
  switch (status) {
    case "complete":
      return "bg-toxic";
    case "in_progress":
      return "bg-blue-400";
    case "blocked":
      return "bg-destructive";
    default:
      return "bg-muted-foreground/40";
  }
}

function WorkloadBadge({ ratio }: { ratio: number }) {
  if (ratio > 1.3) {
    return (
      <span
        title="Overloaded"
        className="ml-1 inline-flex items-center rounded-sm bg-amber-400/10 px-1 py-0.5 text-[10px] font-mono text-amber-400"
      >
        ● high
      </span>
    );
  }
  if (ratio < 0.7) {
    return (
      <span
        title="Underloaded"
        className="ml-1 inline-flex items-center rounded-sm bg-muted/40 px-1 py-0.5 text-[10px] font-mono text-muted-foreground/60"
      >
        ↓ low
      </span>
    );
  }
  return null;
}

function MemberRow({
  member,
  avgHours,
}: {
  member: MemberWithTasks;
  avgHours: number;
}) {
  const ratio = avgHours > 0 ? member.totalHours / avgHours : 0;
  const visible = member.tasks.slice(0, MAX_VISIBLE_TASKS);
  const overflow = member.tasks.length - MAX_VISIBLE_TASKS;

  return (
    <div className="flex items-start gap-4 py-3 border-b border-border/30 last:border-0">
      {/* Avatar + name */}
      <div className="flex items-center gap-2 w-36 shrink-0">
        <div className="h-7 w-7 rounded-full border border-border/60 bg-muted overflow-hidden shrink-0 flex items-center justify-center">
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
          ) : (
            <span className="text-xs font-bold text-muted-foreground">
              {member.name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-foreground truncate">{member.name}</p>
          <div className="flex items-center">
            <span className="text-[10px] font-mono text-muted-foreground/60">
              {member.totalHours}h
            </span>
            <WorkloadBadge ratio={ratio} />
          </div>
        </div>
      </div>

      {/* Task chips */}
      <div className="flex flex-wrap gap-1.5 flex-1">
        {visible.map((task) => (
          <div
            key={task.id}
            title={`[${task.moduleName}] ${task.name}`}
            className="flex items-center gap-1.5 rounded-lg border border-border/50 bg-muted/20 px-2 py-1 text-xs text-muted-foreground max-w-[200px]"
          >
            <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDotColor(task.status)}`} />
            <span className="truncate">{task.name}</span>
          </div>
        ))}
        {overflow > 0 && (
          <div className="flex items-center rounded-lg border border-dashed border-border/40 px-2 py-1 text-[10px] font-mono text-muted-foreground/50">
            +{overflow} more
          </div>
        )}
        {member.tasks.length === 0 && (
          <span className="text-xs text-muted-foreground/40 italic">No tasks assigned</span>
        )}
      </div>
    </div>
  );
}

export function OwnershipMap({ members, unassignedTasks }: OwnershipMapProps) {
  const totalHoursAll = members.reduce((sum, m) => sum + m.totalHours, 0);
  const avgHours = members.length > 0 ? totalHoursAll / members.length : 0;

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-foreground">Ownership Map</h2>
        <div className="flex items-center gap-3 text-[10px] font-mono text-muted-foreground/50">
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-toxic inline-block" /> complete</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-blue-400 inline-block" /> in progress</span>
          <span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-destructive inline-block" /> blocked</span>
        </div>
      </div>

      <div className="rounded-xl border border-border/50 bg-card p-4">
        {members.map((member) => (
          <MemberRow key={member.userId} member={member} avgHours={avgHours} />
        ))}

        {/* Unassigned row */}
        {unassignedTasks.length > 0 && (
          <div className="flex items-start gap-4 py-3 border-t border-border/30 mt-1">
            <div className="flex items-center gap-2 w-36 shrink-0">
              <div className="h-7 w-7 rounded-full border border-dashed border-border/50 bg-muted/30 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-mono text-muted-foreground/50">?</span>
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-muted-foreground/60">Unassigned</p>
                <span className="text-[10px] font-mono text-muted-foreground/40">{unassignedTasks.length} tasks</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5 flex-1">
              {unassignedTasks.slice(0, MAX_VISIBLE_TASKS).map((task) => (
                <div
                  key={task.id}
                  title={task.name}
                  className="flex items-center gap-1.5 rounded-lg border border-dashed border-border/40 bg-muted/10 px-2 py-1 text-xs text-muted-foreground/50"
                >
                  <span className="truncate">{task.name}</span>
                </div>
              ))}
              {unassignedTasks.length > MAX_VISIBLE_TASKS && (
                <div className="flex items-center rounded-lg border border-dashed border-border/40 px-2 py-1 text-[10px] font-mono text-muted-foreground/40">
                  +{unassignedTasks.length - MAX_VISIBLE_TASKS} more
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
