"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Sparkles, Calendar, Clock } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";

interface TaskCardProps {
  id: string;
  index: number;
  name: string;
  moduleName: string;
  assigneeName: string | null;
  assigneeImage: string | null;
  effortHours: number | null;
  dueDate: Date | null;
  hasUnreadRationale: boolean;
  statusColor: string; // Tailwind class
}

export function TaskCard({
  id,
  index,
  name,
  moduleName,
  assigneeName,
  assigneeImage,
  effortHours,
  dueDate,
  hasUnreadRationale,
  statusColor,
}: TaskCardProps) {
  return (
    <Draggable draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            ...provided.draggableProps.style,
            // Ensure no layout jump on drag end
            transition: snapshot.isDragging
              ? provided.draggableProps.style?.transition
              : "transform 0.2s cubic-bezier(0.2, 0, 0, 1)",
          }}
          className="mb-3 outline-none"
        >
          <motion.div
            animate={{
              scale: snapshot.isDragging ? 1.02 : 1,
              boxShadow: snapshot.isDragging
                ? "0 10px 25px -5px rgba(57,255,20,0.15)"
                : "0 0px 0px rgba(0,0,0,0)",
            }}
            transition={{ duration: 0.2 }}
            className={`rounded-xl border border-border/50 bg-card p-4 transition-colors hover:border-border/80 ${
              snapshot.isDragging ? "border-toxic/30 z-50 bg-card/95 backdrop-blur-sm" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-[10px] font-mono font-semibold uppercase tracking-wider text-muted-foreground bg-muted/40 px-2 py-0.5 rounded flex items-center gap-1.5 border border-border/50">
                <span className={`h-1.5 w-1.5 rounded-full ${statusColor}`} />
                {moduleName}
              </span>
              {hasUnreadRationale && (
                <Sparkles className="h-3 w-3 text-toxic shrink-0 mt-0.5" />
              )}
            </div>

            <h4 className="text-sm font-semibold text-foreground leading-snug mb-4">
              {name}
            </h4>

            <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/40">
              <div className="flex items-center gap-3">
                {assigneeImage ? (
                  <Image
                    src={assigneeImage}
                    alt={assigneeName || "Assignee"}
                    width={20}
                    height={20}
                    className="rounded-full bg-muted border border-border"
                  />
                ) : (
                  <div className="h-5 w-5 rounded-full bg-muted border border-border flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      {assigneeName ? assigneeName[0].toUpperCase() : "?"}
                    </span>
                  </div>
                )}

                {effortHours && (
                  <div className="flex items-center gap-1 text-[10px] text-muted-foreground font-mono">
                    <Clock className="h-3 w-3" />
                    {effortHours}h
                  </div>
                )}
              </div>

              {dueDate && (
                <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {dueDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </Draggable>
  );
}
