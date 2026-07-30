"use client";

import { ChevronDown } from "lucide-react";
import type { SortOption, FilterOption } from "@/types/project";

interface SortFilterBarProps {
  sort: SortOption;
  onSortChange: (sort: SortOption) => void;
  filter: FilterOption;
  onFilterChange: (filter: FilterOption) => void;
  totalCount: number;
}

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "lastActive", label: "Recently Active" },
  { value: "deadline", label: "Deadline" },
  { value: "progress", label: "Progress" },
  { value: "alphabetical", label: "A – Z" },
];

const FILTER_OPTIONS: { value: FilterOption; label: string }[] = [
  { value: "all", label: "All Projects" },
  { value: "owned", label: "Owned by me" },
  { value: "member", label: "I'm a member" },
];

export function SortFilterBar({
  sort,
  onSortChange,
  filter,
  onFilterChange,
  totalCount,
}: SortFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {/* Filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {FILTER_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            id={`filter-${opt.value}`}
            onClick={() => onFilterChange(opt.value)}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all duration-150 ${
              filter === opt.value
                ? "bg-toxic/10 text-toxic border-toxic/40"
                : "bg-transparent text-muted-foreground border-border hover:border-border/80 hover:text-foreground"
            }`}
          >
            {opt.label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-1">
          {totalCount} project{totalCount !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Sort dropdown */}
      <div className="relative">
        <label htmlFor="sort-select" className="sr-only">Sort projects</label>
        <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center">
          <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
        </div>
        <select
          id="sort-select"
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortOption)}
          className="appearance-none rounded-xl border border-border bg-card px-3.5 py-1.5 pr-8 text-xs font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-toxic/40 cursor-pointer"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
