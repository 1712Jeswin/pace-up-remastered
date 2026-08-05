"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Bell, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TopBarProps {
  projectId: string;
  projectName: string;
  deadline: Date | null;
  progress: number;
}

export function TopBar({ projectId, projectName, deadline, progress }: TopBarProps) {
  const [timeLeft, setTimeLeft] = useState<string>("");

  useEffect(() => {
    if (!deadline) {
      setTimeLeft("No deadline");
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const diff = deadline.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft("Deadline passed");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);

      if (days > 0) {
        setTimeLeft(`${days}d ${hours}h left`);
      } else {
        const mins = Math.floor((diff / 1000 / 60) % 60);
        setTimeLeft(`${hours}h ${mins}m left`);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000); // update every minute
    return () => clearInterval(interval);
  }, [deadline]);

  // Mock notification count since we don't have a notifications table yet.
  const unreadCount = 3;

  return (
    <header className="h-16 border-b border-border/40 bg-card/50 backdrop-blur-sm flex items-center justify-between px-6 sticky top-0 z-20">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold text-foreground tracking-wide">
          {projectName}
        </h1>
        
        {/* Progress indicator */}
        <div className="flex items-center gap-2 ml-4">
          <div className="text-[10px] font-mono text-muted-foreground/60 w-8 text-right">
            {progress}%
          </div>
          <div className="h-1.5 w-24 rounded-full bg-muted/40 overflow-hidden relative">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="absolute left-0 top-0 bottom-0 rounded-full bg-toxic shadow-[0_0_8px_rgba(57,255,20,0.4)]"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Deadline Countdown */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/30 border border-border/40">
          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-xs font-mono text-muted-foreground/80">
            {timeLeft}
          </span>
        </div>

        {/* Notification Bell */}
        <Link
          href={`/projects/${projectId}/notifications`}
          className="relative p-2 rounded-full text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive border border-background shadow-[0_0_8px_rgba(255,0,0,0.5)]" />
          )}
        </Link>
      </div>
    </header>
  );
}
