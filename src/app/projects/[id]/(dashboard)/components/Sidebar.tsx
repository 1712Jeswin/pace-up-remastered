"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CheckSquare,
  MessageSquare,
  UploadCloud,
  Users,
  BrainCircuit,
  Settings,
  FolderKanban
} from "lucide-react";

interface SidebarProps {
  projectId: string;
}

export function Sidebar({ projectId }: SidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: `/projects/${projectId}`, icon: LayoutDashboard, exact: true },
    { label: "Tasks", href: `/projects/${projectId}/tasks`, icon: CheckSquare },
    { label: "Standup Feed", href: `/projects/${projectId}/standup`, icon: MessageSquare },
    { label: "Submissions", href: `/projects/${projectId}/submissions`, icon: UploadCloud },
    { label: "Team", href: `/projects/${projectId}/team`, icon: Users },
    { label: "Project Memory", href: `/projects/${projectId}/memory`, icon: BrainCircuit },
    { label: "Settings", href: `/projects/${projectId}/settings`, icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-border/40 bg-card/30 flex flex-col h-full">
      {/* Project Switcher header */}
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors group"
        >
          <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-muted border border-border/60 group-hover:border-toxic/50 transition-colors">
            <FolderKanban className="h-4 w-4" />
          </div>
          <span>Projects Hub</span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-1.5">
        {navItems.map((item) => {
          const isActive = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive
                  ? "bg-toxic/10 text-toxic shadow-[inset_2px_0_0_0_rgba(57,255,20,1)]"
                  : "text-muted-foreground hover:bg-muted/30 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 ${isActive ? "text-toxic" : "text-muted-foreground/70"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
