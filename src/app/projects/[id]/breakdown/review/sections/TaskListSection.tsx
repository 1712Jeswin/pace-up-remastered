import { TaskCard } from "../components/TaskCard";

interface Member {
  userId: string;
  name: string;
  image: string | null;
}

interface Task {
  id: string;
  name: string;
  description: string | null;
  effortHours: number | null;
  assigneeId: string | null;
  assignee: { name: string; image: string | null } | null;
  aiRationale: string | null;
  lowConfidence: boolean;
  lowConfidenceNote: string | null;
  humanOverride: boolean;
  order: number;
}

interface Module {
  id: string;
  name: string;
  tasks: Task[];
}

interface TaskListSectionProps {
  projectId: string;
  modules: Module[];
  allMembers: Member[];
}

export function TaskListSection({ projectId, modules, allMembers }: TaskListSectionProps) {
  return (
    <section>
      <h2 className="text-base font-semibold text-foreground mb-4">Tasks by Module</h2>
      <div className="flex flex-col gap-8">
        {modules.map((mod) => (
          <div key={mod.id}>
            {/* Module header divider */}
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-border/40" />
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest px-2">
                {mod.name}
              </span>
              <div className="h-px flex-1 bg-border/40" />
            </div>

            {/* Task cards — each card manages its own interactive state */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {mod.tasks
                .sort((a, b) => a.order - b.order)
                .map((task) => (
                  <TaskCard
                    key={task.id}
                    id={task.id}
                    projectId={projectId}
                    initialName={task.name}
                    initialDescription={task.description}
                    effortHours={task.effortHours}
                    initialAssigneeId={task.assigneeId}
                    initialAssignee={task.assignee}
                    aiRationale={task.aiRationale}
                    initialLowConfidence={task.lowConfidence}
                    lowConfidenceNote={task.lowConfidenceNote}
                    initialHumanOverride={task.humanOverride}
                    allMembers={allMembers}
                  />
                ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
