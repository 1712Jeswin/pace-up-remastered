"use client";

import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, FileUp, UserPlus, Sparkles, Activity } from "lucide-react";

export type ActivityType = "task_completed" | "submission_uploaded" | "member_joined" | "breakdown_regenerated";

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  userId: string | null;
  actorName: string | null;
  actorImage: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

interface ActivityFeedProps {
  activities: ActivityEvent[];
}

function getIcon(type: ActivityType) {
  switch (type) {
    case "task_completed":
      return <CheckCircle2 className="h-3.5 w-3.5 text-toxic" />;
    case "submission_uploaded":
      return <FileUp className="h-3.5 w-3.5 text-blue-400" />;
    case "member_joined":
      return <UserPlus className="h-3.5 w-3.5 text-amber-400" />;
    case "breakdown_regenerated":
      return <Sparkles className="h-3.5 w-3.5 text-toxic" />;
    default:
      return <Activity className="h-3.5 w-3.5 text-muted-foreground" />;
  }
}

function getMessage(event: ActivityEvent) {
  const actor = event.actorName || "System";
  
  switch (event.type) {
    case "task_completed":
      return (
        <span>
          <span className="font-semibold text-foreground">{actor}</span> completed task{" "}
          <span className="text-foreground">"{event.metadata.taskName}"</span>
        </span>
      );
    case "submission_uploaded":
      return (
        <span>
          <span className="font-semibold text-foreground">{actor}</span> uploaded a submission for{" "}
          <span className="text-foreground">"{event.metadata.taskName}"</span>
        </span>
      );
    case "member_joined":
      return (
        <span>
          <span className="font-semibold text-foreground">{actor}</span> joined the project as{" "}
          <span className="text-foreground">{event.metadata.role}</span>
        </span>
      );
    case "breakdown_regenerated":
      return (
        <span>
          <span className="font-semibold text-foreground">{actor}</span> regenerated the project breakdown
        </span>
      );
    default:
      return <span>Unknown activity</span>;
  }
}

function timeAgo(date: Date) {
  const diff = new Date().getTime() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export function ActivityFeed({ activities }: ActivityFeedProps) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-4">
        <Activity className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Recent Activity</h2>
      </div>

      <div className="rounded-xl border border-border/50 bg-card">
        {activities.length === 0 ? (
          <div className="p-6 text-center text-sm text-muted-foreground/60 italic">
            No activity yet.
          </div>
        ) : (
          <div className="max-h-[300px] overflow-y-auto px-4 py-2">
            <AnimatePresence initial={false}>
              {activities.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  // New items slide in; initial load has no initial=false animation
                  transition={{ duration: 0.2 }}
                  className={`flex items-start gap-3 py-3 ${
                    index !== activities.length - 1 ? "border-b border-border/30" : ""
                  }`}
                >
                  <div className="mt-0.5 rounded-full bg-muted/40 p-1.5 shrink-0 border border-border/40">
                    {getIcon(event.type)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {getMessage(event)}
                    </p>
                  </div>
                  <span className="shrink-0 text-[10px] font-mono text-muted-foreground/50 whitespace-nowrap pt-0.5">
                    {timeAgo(new Date(event.createdAt))}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </section>
  );
}
