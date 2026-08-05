"use client";

import { useState, useEffect } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { updateTaskStatusAction, TaskStatus } from "@/app/actions/tasks";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { ViewControls } from "./ViewControls";

export interface RawTask {
  id: string;
  name: string;
  status: string;
  effortHours: number | null;
  assigneeName: string | null;
  assigneeImage: string | null;
  moduleName: string;
  dueDate: Date | null;
  aiRationale: string | null;
}

interface TasksBoardClientProps {
  projectId: string;
  initialTasks: RawTask[];
}

const COLUMNS: { id: TaskStatus; title: string }[] = [
  { id: "not_started", title: "To Do" },
  { id: "in_progress", title: "In Progress" },
  { id: "in_review", title: "In Review" },
  { id: "complete", title: "Done" },
];

function getStatusColor(status: string) {
  switch (status) {
    case "not_started":
      return "bg-muted-foreground";
    case "in_progress":
      return "bg-blue-400";
    case "in_review":
      return "bg-amber-400";
    case "complete":
      return "bg-toxic";
    case "blocked":
      return "bg-red-500";
    default:
      return "bg-muted-foreground";
  }
}

export function TasksBoardClient({ projectId, initialTasks }: TasksBoardClientProps) {
  const [tasks, setTasks] = useState<RawTask[]>(initialTasks);
  const [viewMode, setViewMode] = useState<"board" | "list">("board");
  const [searchQuery, setSearchQuery] = useState("");
  const [isClient, setIsClient] = useState(false);

  // Avoid hydration mismatch for DND context
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }

    const newStatus = destination.droppableId as TaskStatus;

    // Optimistic UI update
    setTasks((prev) => {
      const newTasks = [...prev];
      const taskIndex = newTasks.findIndex((t) => t.id === draggableId);
      if (taskIndex !== -1) {
        newTasks[taskIndex] = { ...newTasks[taskIndex], status: newStatus };
      }
      return newTasks;
    });

    // Fire server action to update DB
    const res = await updateTaskStatusAction(projectId, draggableId, newStatus);
    if (!res.success) {
      // Revert on failure (or show toast)
      console.error(res.error);
      setTasks(initialTasks);
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isClient) return null;

  return (
    <div className="flex flex-col h-full">
      <ViewControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />

      {viewMode === "board" ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 min-h-0 flex-1 h-full pb-4">
            {COLUMNS.map((col) => {
              const colTasks = filteredTasks.filter((t) => {
                if (col.id === "not_started") return t.status === "not_started" || t.status === "blocked";
                return t.status === col.id;
              });

              return (
                <BoardColumn key={col.id} id={col.id} title={col.title} count={colTasks.length}>
                  {colTasks.map((task, index) => (
                    <TaskCard
                      key={task.id}
                      id={task.id}
                      index={index}
                      name={task.name}
                      moduleName={task.moduleName}
                      assigneeName={task.assigneeName}
                      assigneeImage={task.assigneeImage}
                      effortHours={task.effortHours}
                      dueDate={task.dueDate}
                      hasUnreadRationale={!!task.aiRationale}
                      statusColor={getStatusColor(task.status)}
                    />
                  ))}
                </BoardColumn>
              );
            })}
          </div>
        </DragDropContext>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl bg-muted/5">
          <p className="text-muted-foreground text-sm">List view coming soon (Phase 30)</p>
        </div>
      )}
    </div>
  );
}
