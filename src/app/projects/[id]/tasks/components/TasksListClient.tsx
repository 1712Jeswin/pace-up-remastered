"use client";

import { useState } from "react";
import Image from "next/image";
import { RawTask } from "./TasksBoardClient";
import { Clock, Calendar, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";

interface TasksListClientProps {
  tasks: RawTask[];
}

type SortField = "name" | "moduleName" | "assigneeName" | "status" | "dueDate" | "effortHours";
type SortDirection = "asc" | "desc";

export function TasksListClient({ tasks }: TasksListClientProps) {
  const [sortField, setSortField] = useState<SortField>("dueDate");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    let valA: any = a[sortField];
    let valB: any = b[sortField];

    if (valA === null) valA = "";
    if (valB === null) valB = "";

    if (sortField === "dueDate") {
      valA = a.dueDate ? a.dueDate.getTime() : 0;
      valB = b.dueDate ? b.dueDate.getTime() : 0;
    }

    if (valA < valB) return sortDirection === "asc" ? -1 : 1;
    if (valA > valB) return sortDirection === "asc" ? 1 : -1;
    return 0;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "not_started": return "bg-muted-foreground";
      case "in_progress": return "bg-blue-400";
      case "in_review": return "bg-amber-400";
      case "complete": return "bg-toxic";
      case "blocked": return "bg-red-500";
      default: return "bg-muted-foreground";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "not_started": return "To Do";
      case "in_progress": return "In Progress";
      case "in_review": return "In Review";
      case "complete": return "Done";
      case "blocked": return "Blocked";
      default: return status;
    }
  };

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ArrowUpDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDirection === "asc" ? (
      <ArrowUp className="h-3 w-3 text-foreground" />
    ) : (
      <ArrowDown className="h-3 w-3 text-foreground" />
    );
  };

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center border border-dashed border-border/40 rounded-2xl bg-muted/5 min-h-[300px]">
        <p className="text-muted-foreground text-sm">No tasks match your filters.</p>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted/20 text-xs text-muted-foreground uppercase tracking-wider border-b border-border/40">
            <tr>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("name")}>
                <div className="flex items-center gap-2">Task Name <SortIcon field="name" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("moduleName")}>
                <div className="flex items-center gap-2">Module <SortIcon field="moduleName" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("assigneeName")}>
                <div className="flex items-center gap-2">Assignee <SortIcon field="assigneeName" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("status")}>
                <div className="flex items-center gap-2">Status <SortIcon field="status" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("dueDate")}>
                <div className="flex items-center gap-2">Due Date <SortIcon field="dueDate" /></div>
              </th>
              <th className="px-4 py-3 font-medium cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => handleSort("effortHours")}>
                <div className="flex items-center gap-2">Effort <SortIcon field="effortHours" /></div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/20">
            {sortedTasks.map((task) => (
              <tr key={task.id} className="hover:bg-muted/10 transition-colors">
                <td className="px-4 py-3 font-medium text-foreground">
                  {task.name}
                </td>
                <td className="px-4 py-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground bg-muted/40 px-2 py-1 rounded border border-border/50">
                    {task.moduleName}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    {task.assigneeImage ? (
                      <Image
                        src={task.assigneeImage}
                        alt={task.assigneeName || "Assignee"}
                        width={20}
                        height={20}
                        className="rounded-full bg-muted border border-border"
                      />
                    ) : (
                      <div className="h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center">
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {task.assigneeName ? task.assigneeName[0].toUpperCase() : "?"}
                        </span>
                      </div>
                    )}
                    <span className="text-muted-foreground text-xs">{task.assigneeName || "Unassigned"}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className={`h-2 w-2 rounded-full ${getStatusColor(task.status)}`} />
                    <span className="text-xs text-muted-foreground">{getStatusLabel(task.status)}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {task.dueDate ? (
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3" />
                      {task.dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-muted-foreground text-xs">
                  {task.effortHours ? (
                    <div className="flex items-center gap-1.5 font-mono">
                      <Clock className="h-3 w-3" />
                      {task.effortHours}h
                    </div>
                  ) : (
                    <span className="text-muted-foreground/50">-</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
