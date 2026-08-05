"use client";

import { LayoutGrid, List as ListIcon, Search, Plus, Filter } from "lucide-react";

interface ViewControlsProps {
  viewMode: "board" | "list";
  setViewMode: (mode: "board" | "list") => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

export function ViewControls({
  viewMode,
  setViewMode,
  searchQuery,
  setSearchQuery,
}: ViewControlsProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
      <div className="flex items-center gap-4">
        {/* View Toggle */}
        <div className="flex items-center p-1 bg-muted/20 border border-border/40 rounded-lg">
          <button
            onClick={() => setViewMode("board")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "board"
                ? "bg-card shadow-sm border border-border/50 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Board View"
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`p-1.5 rounded-md transition-all ${
              viewMode === "list"
                ? "bg-card shadow-sm border border-border/50 text-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="List View"
          >
            <ListIcon className="h-4 w-4" />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-1.5 h-9 bg-muted/20 border border-border/40 rounded-lg text-sm text-foreground focus:outline-none focus:border-toxic/50 focus:ring-1 focus:ring-toxic/50 transition-all w-full sm:w-64 placeholder:text-muted-foreground/60"
          />
        </div>
        
        {/* Filter Placeholder */}
        <button className="flex items-center gap-2 h-9 px-3 rounded-lg border border-border/40 bg-muted/20 text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors text-sm">
          <Filter className="h-3.5 w-3.5" />
          Filters
        </button>
      </div>

      {/* Add Task Action */}
      <button className="flex items-center gap-2 h-9 px-4 rounded-lg bg-toxic text-background font-semibold hover:bg-toxic/90 transition-colors text-sm shadow-[0_0_15px_rgba(57,255,20,0.2)]">
        <Plus className="h-4 w-4" />
        Add Task
      </button>
    </div>
  );
}
