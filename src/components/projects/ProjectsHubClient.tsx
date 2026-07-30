"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import { SortFilterBar } from "./SortFilterBar";
import { PendingInvitesBanner } from "./PendingInvitesBanner";
import { ArchivedSection } from "./ArchivedSection";
import { ProjectsEmptyState } from "./ProjectsEmptyState";
import type { ProjectCardData, SortOption, FilterOption } from "@/types/project";

interface ProjectsHubClientProps {
  projects: ProjectCardData[];
  pendingInviteCount: number;
}

// ─── Sort logic ───────────────────────────────────────────────────────────────

function sortProjects(projects: ProjectCardData[], sort: SortOption): ProjectCardData[] {
  return [...projects].sort((a, b) => {
    switch (sort) {
      case "lastActive":
        return b.lastActiveAt.getTime() - a.lastActiveAt.getTime();
      case "deadline": {
        // No deadline sorts last
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return a.deadline.getTime() - b.deadline.getTime();
      }
      case "progress":
        return b.progress - a.progress;
      case "alphabetical":
        return a.title.localeCompare(b.title);
      default:
        return 0;
    }
  });
}

// ─── Filter logic ─────────────────────────────────────────────────────────────

function filterProjects(
  projects: ProjectCardData[],
  filter: FilterOption,
  currentUserId: string
): ProjectCardData[] {
  return projects.filter((p) => {
    switch (filter) {
      case "all":
        return p.archivedAt === null;
      case "owned":
        return p.archivedAt === null && p.role === "owner";
      case "member":
        return p.archivedAt === null && p.role === "member";
      case "archived":
        return p.archivedAt !== null;
      default:
        return true;
    }
  });
}

// ─── Hub ─────────────────────────────────────────────────────────────────────

export function ProjectsHubClient({
  projects,
  pendingInviteCount,
}: ProjectsHubClientProps) {
  const [sort, setSort] = useState<SortOption>("lastActive");
  const [filter, setFilter] = useState<FilterOption>("all");

  const activeProjects = useMemo(
    () => sortProjects(filterProjects(projects, filter, ""), sort),
    [projects, filter, sort]
  );

  const archivedProjects = useMemo(
    () => projects.filter((p) => p.archivedAt !== null),
    [projects]
  );

  const hasAnyActiveProjects = projects.some((p) => p.archivedAt === null);

  return (
    <div className="min-h-screen bg-background">
      {/* Page header */}
      <div className="border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-heading text-2xl font-bold text-foreground tracking-tight">
                Your Projects
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                {projects.filter((p) => p.archivedAt === null).length} active
              </p>
            </div>
            <Link
              id="new-project-cta"
              href="/projects/new"
              className="flex items-center gap-2 rounded-full bg-toxic px-5 py-2.5 text-sm font-bold text-toxic-foreground hover:bg-toxic/90 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_16px_rgba(57,255,20,0.2)]"
            >
              <Plus className="h-4 w-4" />
              New Project
            </Link>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Pending invites banner */}
        <PendingInvitesBanner count={pendingInviteCount} />

        {/* Empty state: no active projects at all */}
        {!hasAnyActiveProjects && <ProjectsEmptyState />}

        {/* Sort / filter bar — only shown when there are projects */}
        {hasAnyActiveProjects && (
          <SortFilterBar
            sort={sort}
            onSortChange={setSort}
            filter={filter}
            onFilterChange={setFilter}
            totalCount={activeProjects.length}
          />
        )}

        {/* Active project grid */}
        {hasAnyActiveProjects && activeProjects.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        )}

        {/* No results for current filter */}
        {hasAnyActiveProjects && activeProjects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <p className="text-muted-foreground text-sm">
              No projects match this filter.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-sm font-semibold text-toxic hover:underline"
            >
              Clear filter
            </button>
          </div>
        )}

        {/* Archived section */}
        <ArchivedSection projects={archivedProjects} />
      </div>
    </div>
  );
}
