/**
 * Mock UI component for Stage 1: "Create Your Project"
 * Depicts a simple project creation form/card.
 */
export function CreateProjectMock() {
  return (
    <div className="w-full max-w-sm mx-auto space-y-4 font-mono text-xs">
      <div className="rounded-xl border border-border bg-card/80 p-5 space-y-3 shadow-lg">
        <div className="text-toxic font-bold text-base font-sans tracking-tight">New Project</div>
        <div className="space-y-2">
          <div className="h-2 w-1/2 rounded bg-muted-foreground/20" />
          <div className="h-7 rounded-md border border-border bg-input/60" />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-1/3 rounded bg-muted-foreground/20" />
          <div className="h-20 rounded-md border border-border bg-input/60" />
        </div>
        <div className="flex gap-2 items-center">
          <div className="h-6 w-6 rounded-full bg-muted-foreground/20 flex-shrink-0" />
          <div className="h-2 w-20 rounded bg-muted-foreground/20" />
          <div className="h-6 w-6 rounded-full bg-muted-foreground/20 flex-shrink-0 ml-1" />
          <div className="h-2 w-12 rounded bg-muted-foreground/20" />
        </div>
        <div className="rounded-lg bg-toxic px-4 py-2 text-center text-xs font-semibold text-toxic-foreground">
          Create & Let AI Plan It →
        </div>
      </div>
    </div>
  );
}

/**
 * Mock UI component for Stage 2: "AI Breaks It Down"
 * Depicts a task breakdown tree.
 */
export function AiBreakdownMock() {
  const tasks = [
    { label: "Auth Module", sub: ["Login API", "JWT Middleware", "Refresh Tokens"] },
    { label: "Dashboard UI", sub: ["Chart Components", "Filter Panel"] },
  ];

  return (
    <div className="w-full max-w-sm mx-auto font-mono text-xs space-y-3">
      <div className="flex items-center gap-2 text-toxic font-bold text-sm font-sans">
        <span className="h-2 w-2 rounded-full bg-toxic animate-pulse" />
        AI is breaking it down...
      </div>
      {tasks.map((task) => (
        <div key={task.label} className="rounded-lg border border-border bg-card/80 p-3 shadow">
          <div className="text-foreground font-semibold text-xs mb-2 flex items-center gap-2">
            <span className="text-toxic">▸</span> {task.label}
          </div>
          <div className="pl-4 space-y-1.5 border-l border-border/60">
            {task.sub.map((s) => (
              <div key={s} className="flex items-center gap-2 text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                {s}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mock UI component for Stage 3: "Team Gets Matched & Assigned"
 * Depicts task-to-team-member assignment cards.
 */
export function TeamAssignmentMock() {
  const assignments = [
    { task: "Login API", member: "Alex K.", tag: "Backend" },
    { task: "JWT Middleware", member: "Priya R.", tag: "Security" },
    { task: "Chart Components", member: "Jamie L.", tag: "Frontend" },
    { task: "Filter Panel", member: "Alex K.", tag: "Frontend" },
  ];

  return (
    <div className="w-full max-w-sm mx-auto font-mono text-xs space-y-2">
      {assignments.map((a) => (
        <div key={a.task} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-card/80 px-3 py-2.5 shadow">
          <div className="flex items-center gap-2 min-w-0">
            <div className="h-6 w-6 rounded-full bg-toxic/20 border border-toxic/30 flex items-center justify-center text-toxic text-[10px] font-bold flex-shrink-0">
              {a.member.charAt(0)}
            </div>
            <span className="text-foreground truncate">{a.task}</span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="text-muted-foreground">{a.member}</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{a.tag}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Mock UI component for Stage 4: "AI Keeps You On Track"
 * Depicts a standup summary + blocker alert.
 */
export function OnTrackMock() {
  return (
    <div className="w-full max-w-sm mx-auto font-mono text-xs space-y-3">
      <div className="rounded-lg border border-border bg-card/80 p-3 shadow space-y-2">
        <div className="text-toxic font-semibold font-sans text-xs flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-toxic flex-shrink-0" />
          Daily Standup — Today
        </div>
        <div className="space-y-1.5 text-muted-foreground">
          <div className="flex gap-2"><span className="text-foreground font-semibold">Alex K.</span>Completed Login API. Starting refresh tokens.</div>
          <div className="flex gap-2"><span className="text-foreground font-semibold">Priya R.</span>PR up for middleware. Awaiting review.</div>
        </div>
      </div>
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 shadow flex gap-2">
        <span className="text-destructive text-base flex-shrink-0">⚠</span>
        <div className="space-y-0.5">
          <div className="text-destructive font-semibold font-sans text-xs">Blocker Detected</div>
          <div className="text-muted-foreground">
            Refresh tokens PR has been open 48h. AI suggests escalating to team lead.
          </div>
        </div>
      </div>
    </div>
  );
}
