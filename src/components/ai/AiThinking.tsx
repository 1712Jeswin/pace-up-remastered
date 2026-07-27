"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { motionPresets } from "@/lib/motion";
import { Cpu } from "lucide-react";

interface AiThinkingProps {
  /** Array of status lines to rotate through, e.g. ["Analyzing scope...", "Balancing workload..."] */
  statusLines: string[];
  /** Optional extra class names for the container */
  className?: string;
  children?: React.ReactNode;
}

/**
 * AiThinking — shown while an AI generation is in progress.
 * Renders a slow pulsing green glow border and cycles through status text lines.
 */
export function AiThinking({
  statusLines,
  className = "",
  children,
}: AiThinkingProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (statusLines.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % statusLines.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [statusLines]);

  return (
    <motion.div
      className={`relative rounded-lg border border-toxic/40 bg-card p-4 ${className}`}
      animate={{
        boxShadow: [
          "0 0 8px -2px rgba(57,255,20,0.1)",
          "0 0 20px -2px rgba(57,255,20,0.35)",
          "0 0 8px -2px rgba(57,255,20,0.1)",
        ],
      }}
      transition={{
        duration: 2.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="flex items-center gap-2 mb-3">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <Cpu className="h-4 w-4 text-toxic" />
        </motion.div>
        <AnimatePresence mode="wait">
          <motion.span
            key={currentIndex}
            className="text-sm font-mono text-toxic"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              duration: motionPresets.durations.micro,
              ease: motionPresets.easing.easeOutCubic,
            }}
          >
            {statusLines[currentIndex]}
          </motion.span>
        </AnimatePresence>
      </div>
      {children && <div className="text-muted-foreground">{children}</div>}
    </motion.div>
  );
}
