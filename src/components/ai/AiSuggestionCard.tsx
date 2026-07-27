"use client";

import { motion } from "framer-motion";
import { motionPresets } from "@/lib/motion";
import { Sparkles, Check, X } from "lucide-react";

interface AiSuggestionCardProps {
  /** A short headline for the suggestion */
  title: string;
  /** The suggestion body — detail or rationale */
  children: React.ReactNode;
  /** Callback fired when the user clicks Accept */
  onAccept: () => void;
  /** Callback fired when the user clicks Dismiss */
  onDismiss: () => void;
  /** Optional extra class names for the container */
  className?: string;
}

/**
 * AiSuggestionCard — gold-accented card for actionable AI proposals.
 * IMPORTANT: This card never auto-applies. The user must explicitly Accept or Dismiss.
 */
export function AiSuggestionCard({
  title,
  children,
  onAccept,
  onDismiss,
  className = "",
}: AiSuggestionCardProps) {
  return (
    <motion.div
      className={`rounded-lg border border-warning/40 bg-warning/5 p-4 ${className}`}
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={{
        duration: motionPresets.durations.micro,
        ease: motionPresets.easing.easeOutCubic,
      }}
    >
      {/* Header */}
      <div className="flex items-start gap-2 mb-2">
        <Sparkles className="h-4 w-4 text-warning mt-0.5 shrink-0" />
        <p className="text-sm font-semibold text-warning">{title}</p>
      </div>

      {/* Body */}
      <div className="text-sm text-muted-foreground mb-4 pl-6">{children}</div>

      {/* Actions — user must explicitly choose */}
      <div className="flex items-center gap-2 pl-6">
        <button
          onClick={onAccept}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium bg-warning text-black hover:bg-warning/90 transition-colors"
        >
          <Check className="h-3.5 w-3.5" />
          Accept
        </button>
        <button
          onClick={onDismiss}
          className="inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium border border-border text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Dismiss
        </button>
      </div>
    </motion.div>
  );
}
