interface Module {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
}

interface ModuleOverviewSectionProps {
  modules: Module[];
}

export function ModuleOverviewSection({ modules }: ModuleOverviewSectionProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-3">Modules</h2>
      {/* Horizontal scrollable strip */}
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {modules.map((mod, idx) => (
          <div
            key={mod.id}
            className="shrink-0 w-52 rounded-xl border border-border/50 bg-card p-4 flex flex-col gap-2"
          >
            {/* Module index badge */}
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono text-muted-foreground/60 uppercase tracking-widest">
                Module {idx + 1}
              </span>
              <span className="rounded-full bg-muted/60 border border-border/40 px-2 py-0.5 text-[10px] font-mono text-muted-foreground">
                {mod.taskCount} {mod.taskCount === 1 ? "task" : "tasks"}
              </span>
            </div>

            {/* Name */}
            <h3 className="text-sm font-semibold text-foreground leading-snug">{mod.name}</h3>

            {/* Description */}
            {mod.description && (
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3">
                {mod.description}
              </p>
            )}

            {/* Bottom accent bar — color cycles through a small palette */}
            <div
              className="mt-auto h-0.5 w-full rounded-full opacity-60"
              style={{
                background: MODULE_ACCENT_COLORS[idx % MODULE_ACCENT_COLORS.length],
              }}
            />
          </div>
        ))}
      </div>
    </section>
  );
}

// Soft accent colors for module cards — avoids any one color feeling too prominent
const MODULE_ACCENT_COLORS = [
  "linear-gradient(90deg, #39ff14 0%, #00d4ff 100%)",
  "linear-gradient(90deg, #a855f7 0%, #ec4899 100%)",
  "linear-gradient(90deg, #f59e0b 0%, #ef4444 100%)",
  "linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)",
  "linear-gradient(90deg, #10b981 0%, #3b82f6 100%)",
  "linear-gradient(90deg, #f97316 0%, #eab308 100%)",
  "linear-gradient(90deg, #8b5cf6 0%, #6366f1 100%)",
  "linear-gradient(90deg, #06b6d4 0%, #10b981 100%)",
];
