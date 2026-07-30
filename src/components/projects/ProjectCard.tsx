"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Clock, CalendarClock, Crown, User } from "lucide-react";
import type { ProjectCardData } from "@/types/project";

interface ProjectCardProps {
  project: ProjectCardData;
}

// ─── Deadline proximity helpers ───────────────────────────────────────────────

type DeadlineStatus = "none" | "ok" | "soon" | "overdue";

function getDeadlineStatus(deadline: Date | null): DeadlineStatus {
  if (!deadline) return "none";
  const now = Date.now();
  const ms = deadline.getTime() - now;
  if (ms < 0) return "overdue";
  // "Soon" = within 72 hours (configurable constant)
  const SOON_THRESHOLD_MS = 72 * 60 * 60 * 1000;
  if (ms < SOON_THRESHOLD_MS) return "soon";
  return "ok";
}

function formatDeadline(deadline: Date): string {
  return deadline.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatRelativeTime(date: Date): string {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const diffMs = date.getTime() - Date.now();
  const diffMins = Math.round(diffMs / 60_000);
  const diffHrs = Math.round(diffMs / 3_600_000);
  const diffDays = Math.round(diffMs / 86_400_000);

  if (Math.abs(diffMins) < 60) return rtf.format(diffMins, "minute");
  if (Math.abs(diffHrs) < 24) return rtf.format(diffHrs, "hour");
  return rtf.format(diffDays, "day");
}

// ─── Avatar cluster ───────────────────────────────────────────────────────────

function AvatarCluster({ avatars }: { avatars: ProjectCardData["memberAvatars"] }) {
  // Show at most 4 avatars; overflow shown as +N
  const MAX_VISIBLE = 4;
  const visible = avatars.slice(0, MAX_VISIBLE);
  const overflow = avatars.length - MAX_VISIBLE;

  return (
    <div className="flex items-center">
      {visible.map((member, i) => (
        <div
          key={member.id}
          title={member.name}
          style={{ zIndex: visible.length - i, marginLeft: i === 0 ? 0 : "-8px" }}
          className="relative h-7 w-7 rounded-full border-2 border-card bg-muted overflow-hidden"
        >
          {member.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={member.image}
              alt={member.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-[10px] font-bold text-muted-foreground uppercase">
              {member.name.charAt(0)}
            </span>
          )}
        </div>
      ))}
      {overflow > 0 && (
        <div
          style={{ marginLeft: "-8px" }}
          className="relative z-0 flex h-7 w-7 items-center justify-center rounded-full border-2 border-card bg-muted text-[10px] font-bold text-muted-foreground"
        >
          +{overflow}
        </div>
      )}
    </div>
  );
}

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
      <div
        className="h-full rounded-full bg-toxic transition-[width] duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}

// ─── Type badge ───────────────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Hackathon: "bg-info/10 text-info border-info/20",
  "Final-Year Project": "bg-warning/10 text-warning border-warning/20",
  Coursework: "bg-muted text-muted-foreground border-border",
  "Club Project": "bg-toxic/10 text-toxic border-toxic/20",
  Research: "bg-primary/10 text-primary-foreground/70 border-border",
};

// ─── Main card ────────────────────────────────────────────────────────────────

export function ProjectCard({ project }: ProjectCardProps) {
  const deadlineStatus = getDeadlineStatus(project.deadline);

  const deadlineColorClass =
    deadlineStatus === "overdue"
      ? "text-destructive"
      : deadlineStatus === "soon"
      ? "text-warning"
      : "text-muted-foreground";

  const typeColorClass =
    TYPE_COLORS[project.type] ?? "bg-muted text-muted-foreground border-border";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      whileHover={{ y: -3, boxShadow: "0 0 24px rgba(57,255,20,0.10)" }}
      className="group relative rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 transition-colors hover:border-toxic/30 cursor-pointer"
    >
      <Link href={`/projects/${project.id}`} className="absolute inset-0 rounded-2xl" aria-label={`Open project: ${project.title}`} />

      {/* Header row */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <span
            className={`inline-block mb-2 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${typeColorClass}`}
          >
            {project.type}
          </span>
          <h3 className="font-heading font-bold text-foreground text-base leading-snug line-clamp-2">
            {project.title}
          </h3>
        </div>

        {/* Role badge */}
        <span
          className={`shrink-0 flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-semibold ${
            project.role === "owner"
              ? "bg-warning/10 text-warning border border-warning/20"
              : "bg-muted text-muted-foreground border border-border"
          }`}
        >
          {project.role === "owner" ? (
            <Crown className="h-2.5 w-2.5" />
          ) : (
            <User className="h-2.5 w-2.5" />
          )}
          {project.role === "owner" ? "Owner" : "Member"}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Progress</span>
          <span className="font-semibold text-foreground">{project.progress}%</span>
        </div>
        <ProgressBar value={project.progress} />
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between gap-3 pt-1">
        {/* Avatars */}
        <AvatarCluster avatars={project.memberAvatars} />

        {/* Deadline + last active */}
        <div className="flex flex-col items-end gap-1 text-[11px]">
          {project.deadline && (
            <span className={`flex items-center gap-1 font-medium ${deadlineColorClass}`}>
              <CalendarClock className="h-3 w-3" />
              {deadlineStatus === "overdue" ? "Overdue " : ""}
              {formatDeadline(project.deadline)}
            </span>
          )}
          <span className="flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3 w-3" />
            {formatRelativeTime(project.lastActiveAt)}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
