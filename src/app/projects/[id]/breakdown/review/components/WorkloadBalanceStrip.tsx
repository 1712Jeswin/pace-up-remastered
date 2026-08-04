interface WorkloadEntry {
  userId: string;
  name: string;
  image: string | null;
  totalHours: number;
}

interface WorkloadBalanceStripProps {
  members: WorkloadEntry[];
}

export function WorkloadBalanceStrip({ members }: WorkloadBalanceStripProps) {
  const maxHours = Math.max(...members.map((m) => m.totalHours), 1);

  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <h3 className="text-sm font-semibold text-foreground mb-4">Workload Balance</h3>
      <div className="flex flex-col gap-3">
        {members.map((member) => {
          const pct = Math.round((member.totalHours / maxHours) * 100);
          const isEmpty = member.totalHours === 0;

          return (
            <div key={member.userId} className="flex items-center gap-3">
              {/* Avatar */}
              <div className="h-7 w-7 rounded-full bg-muted border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-xs font-bold text-muted-foreground">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Name */}
              <span className="text-xs font-medium text-foreground w-24 shrink-0 truncate">
                {member.name}
              </span>

              {/* Bar track */}
              <div className="flex-1 h-2 rounded-full bg-muted/60 overflow-hidden">
                {!isEmpty && (
                  <div
                    className="h-full rounded-full bg-toxic/70 transition-all duration-700"
                    style={{ width: `${pct}%` }}
                  />
                )}
              </div>

              {/* Hours label */}
              <span className="text-xs font-mono text-muted-foreground w-14 text-right shrink-0">
                {isEmpty ? (
                  <span className="italic opacity-50">0h</span>
                ) : (
                  `~${member.totalHours}h`
                )}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
