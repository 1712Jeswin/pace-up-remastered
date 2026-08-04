"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ModuleOverviewSection } from "./sections/ModuleOverviewSection";
import { MilestoneTimeline } from "./sections/MilestoneTimeline";
import { TaskListSection } from "./sections/TaskListSection";
import { WorkloadBalanceStrip } from "./components/WorkloadBalanceStrip";
import { RegeneratePanel } from "./components/RegeneratePanel";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  userId: string;
  name: string;
  image: string | null;
}

interface Task {
  id: string;
  name: string;
  description: string | null;
  effortHours: number | null;
  assigneeId: string | null;
  assignee: { name: string; image: string | null } | null;
  aiRationale: string | null;
  lowConfidence: boolean;
  lowConfidenceNote: string | null;
  humanOverride: boolean;
  order: number;
}

interface ModuleWithTasks {
  id: string;
  name: string;
  description: string | null;
  taskCount: number;
  tasks: Task[];
}

interface Milestone {
  id: string;
  name: string;
  description: string | null;
  dueDate: Date;
  order: number;
}

interface WorkloadEntry {
  userId: string;
  name: string;
  image: string | null;
  totalHours: number;
}

interface BreakdownReviewShellProps {
  projectId: string;
  projectTitle: string;
  projectDeadline: Date | null;
  modules: ModuleWithTasks[];
  milestones: Milestone[];
  workload: WorkloadEntry[];
  allMembers: Member[];
}

// ─── Animation variants ───────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18 } },
};

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
};

// ─── Component ────────────────────────────────────────────────────────────────

export function BreakdownReviewShell({
  projectId,
  projectTitle,
  projectDeadline,
  modules,
  milestones,
  workload,
  allMembers,
}: BreakdownReviewShellProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "0px 0px -60px 0px" });

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky page header */}
      <header className="border-b border-border/40 bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="mx-auto max-w-5xl px-6 py-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-0.5">
              AI Breakdown
            </p>
            <h1 className="text-lg font-bold text-foreground leading-tight">{projectTitle}</h1>
          </div>
          {/* Confirm & Start button in header for quick access */}
          <button
            type="button"
            onClick={() => {
              // Scroll to the RegeneratePanel's confirm button
              document.getElementById("breakdown-actions")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl bg-toxic/10 border border-toxic/30 px-4 py-2 text-xs font-semibold text-toxic transition-colors hover:bg-toxic/20"
          >
            Review actions ↓
          </button>
        </div>
      </header>

      {/* Starting-point banner */}
      <div className="border-b border-amber-500/20 bg-amber-500/5 px-6 py-2.5">
        <p className="mx-auto max-w-5xl text-xs text-amber-400/80">
          <span className="font-semibold">This is a starting point</span> — adjust anything before locking it in.
        </p>
      </div>

      {/* Staggered content */}
      <motion.div
        ref={ref}
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-12"
      >
        {/* Section 1 — Module Overview */}
        <motion.div variants={sectionVariants}>
          <ModuleOverviewSection
            modules={modules.map((m) => ({
              id: m.id,
              name: m.name,
              description: m.description,
              taskCount: m.taskCount,
            }))}
          />
        </motion.div>

        {/* Section 2 — Milestone Timeline */}
        {milestones.length > 0 && (
          <motion.div variants={sectionVariants}>
            <MilestoneTimeline
              milestones={milestones}
              projectDeadline={projectDeadline}
            />
          </motion.div>
        )}

        {/* Section 3 — Task List (interactive) */}
        <motion.div variants={sectionVariants}>
          <TaskListSection
            projectId={projectId}
            modules={modules}
            allMembers={allMembers}
          />
        </motion.div>

        {/* Section 4 — Workload Balance */}
        {workload.length > 0 && (
          <motion.div variants={sectionVariants}>
            <WorkloadBalanceStrip members={workload} />
          </motion.div>
        )}

        {/* Section 5 — Regenerate / Confirm actions */}
        <motion.div id="breakdown-actions" variants={sectionVariants}>
          <RegeneratePanel projectId={projectId} />
        </motion.div>
      </motion.div>
    </div>
  );
}
