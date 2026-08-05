"use client";

import { useState, useEffect, useMemo } from "react";
import { DragDropContext, DropResult } from "@hello-pangea/dnd";
import { updateTaskStatusAction, TaskStatus } from "@/app/actions/tasks";
import { BoardColumn } from "./BoardColumn";
import { TaskCard } from "./TaskCard";
import { ViewControls } from "./ViewControls";
import { TasksListClient } from "./TasksListClient";

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
  const [assigneeFilter, setAssigneeFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  const [isClient, setIsClient] = useState(false);

  // Avoid hydration mismatch for DND context
  useEffect(() => {
    setIsClient(true);
  }, []);

  const uniqueAssignees = useMemo(() => {
    const names = tasks.map(t => t.assigneeName).filter(Boolean) as string[];
    return Array.from(new Set(names)).sort();
  }, [tasks]);

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
      // Revert on failure
      console.error(res.error);
      setTasks(initialTasks);
    }
  };

  const filteredTasks = tasks.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesAssignee = true;
    if (assigneeFilter === "unassigned") {
      matchesAssignee = !t.assigneeName;
    } else if (assigneeFilter) {
      matchesAssignee = t.assigneeName === assigneeFilter;
    }

    let matchesStatus = true;
    if (statusFilter) {
      // Treat blocked as not_started for filtering logic if not strictly filtering
      // But if strict status filter is on, match exactly.
      matchesStatus = t.status === statusFilter || (statusFilter === "not_started" && t.status === "blocked");
    }

    return matchesSearch && matchesAssignee && matchesStatus;
  });

  if (!isClient) return null;

  return (
    <div className="flex flex-col h-full">
      <ViewControls
        viewMode={viewMode}
        setViewMode={setViewMode}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        assigneeFilter={assigneeFilter}
        setAssigneeFilter={setAssigneeFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        uniqueAssignees={uniqueAssignees}
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
        <TasksListClient tasks={filteredTasks} />
      )}
    </div>
  );
}
