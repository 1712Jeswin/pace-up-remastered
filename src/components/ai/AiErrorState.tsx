"use client";

import { motion } from "framer-motion";
import { motionPresets } from "@/lib/motion";
import { CloudOff, RefreshCw } from "lucide-react";

interface AiErrorStateProps {
  /** The error message to display. Defaults to a generic message. */
  message?: string;
  /** Callback fired when the user clicks Retry */
  onRetry: () => void;
  /** Optional extra class names for the container */
  className?: string;
}

/**
 * AiErrorState — shown when AI generation failed or couldn't complete.
 * Neutral gray treatment — never uses danger red (reserved for project risk only).
 */
export function AiErrorState({
  message = "Couldn't complete this action. Please try again.",
  onRetry,
  className = "",
}: AiErrorStateProps) {
  return (
    <div
      className={`rounded-lg border border-border bg-card p-4 ${className}`}
    >
      <div className="flex items-start gap-3">
        <CloudOff className="h-5 w-5 text-muted-foreground mt-0.5 shrink-0" />
        <div className="flex-1">
          <p className="text-sm text-muted-foreground">{message}</p>
          <motion.button
            onClick={onRetry}
            className="mt-3 inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
            whileTap={{ scale: 0.97 }}
            transition={{
              duration: motionPresets.durations.micro,
              ease: motionPresets.easing.easeOutCubic,
            }}
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Retry
          </motion.button>
        </div>
      </div>
    </div>
  );
}
