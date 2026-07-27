"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { motionPresets } from "@/lib/motion";
import { Sparkles } from "lucide-react";

interface AiGeneratedContentProps {
  /** The generated content to display inside the wrapper */
  children: React.ReactNode;
  /** Optional extra class names for the container */
  className?: string;
}

/**
 * AiGeneratedContent — wraps AI-generated content at rest.
 * Shows a thin green left border + a small AI glyph, and stagger-fades in once on mount.
 */
export function AiGeneratedContent({
  children,
  className = "",
}: AiGeneratedContentProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -40px 0px" });

  const containerVariants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.08,
        ease: motionPresets.easing.easeOutCubic,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: motionPresets.durations.transition,
        ease: motionPresets.easing.easeOutCubic,
      },
    },
  };

  return (
    <motion.div
      ref={ref}
      className={`relative pl-3 border-l-2 border-toxic ${className}`}
      variants={containerVariants}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
    >
      {/* AI glyph badge */}
      <div className="absolute -top-1 -right-1 flex items-center gap-1 rounded px-1.5 py-0.5 bg-toxic/10 border border-toxic/20">
        <Sparkles className="h-3 w-3 text-toxic" />
        <span className="text-xs font-mono text-toxic leading-none">AI</span>
      </div>

      <motion.div variants={itemVariants}>{children}</motion.div>
    </motion.div>
  );
}
