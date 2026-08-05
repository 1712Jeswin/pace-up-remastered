"use client";

import { Droppable } from "@hello-pangea/dnd";

interface BoardColumnProps {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}

export function BoardColumn({ id, title, count, children }: BoardColumnProps) {
  return (
    <div className="flex flex-col h-full bg-muted/10 rounded-2xl border border-border/30 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-border/30 bg-muted/20">
        <h3 className="text-sm font-semibold text-foreground tracking-wide">
          {title}
        </h3>
        <span className="text-xs font-mono text-muted-foreground bg-background/50 px-2 py-0.5 rounded-full border border-border/40">
          {count}
        </span>
      </div>
      
      <Droppable droppableId={id}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200 ${
              snapshot.isDraggingOver ? "bg-muted/30" : ""
            }`}
          >
            {children}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}
