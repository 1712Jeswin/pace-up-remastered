import Link from "next/link";
import { Plus, UserPlus, KanbanSquare } from "lucide-react";

interface QuickActionsProps {
  projectId: string;
}

export function QuickActions({ projectId }: QuickActionsProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-3 gap-3">
        <Link
          href={`/projects/${projectId}/tasks`}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-4 hover:bg-muted/30 hover:border-border transition-colors group"
        >
          <div className="rounded-full bg-toxic/10 p-2 text-toxic group-hover:scale-110 transition-transform">
            <Plus className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">Add Task</span>
        </Link>
        
        <Link
          href={`/projects/${projectId}/team`}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-4 hover:bg-muted/30 hover:border-border transition-colors group"
        >
          <div className="rounded-full bg-blue-400/10 p-2 text-blue-400 group-hover:scale-110 transition-transform">
            <UserPlus className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">Invite Member</span>
        </Link>
        
        <Link
          href={`/projects/${projectId}/tasks`}
          className="flex flex-col items-center justify-center gap-2 rounded-xl border border-border/50 bg-card p-4 hover:bg-muted/30 hover:border-border transition-colors group"
        >
          <div className="rounded-full bg-amber-400/10 p-2 text-amber-400 group-hover:scale-110 transition-transform">
            <KanbanSquare className="h-4 w-4" />
          </div>
          <span className="text-xs font-semibold text-foreground">View Board</span>
        </Link>
      </div>
    </section>
  );
}
