"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Plus, Hash } from "lucide-react";

export function ProjectsEmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="flex flex-col items-center justify-center py-24 text-center"
    >
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
        <div className="h-80 w-80 rounded-full bg-toxic/5 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-md">
        <div className="mb-6 flex h-20 w-20 mx-auto items-center justify-center rounded-2xl border border-toxic/20 bg-toxic/5">
          <svg
            className="h-9 w-9 text-toxic"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
            <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v0Z" />
            <path d="M12 12v4" />
            <path d="M10 14h4" />
          </svg>
        </div>

        <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
          No projects yet
        </h2>
        <p className="text-muted-foreground text-sm mb-8 leading-relaxed">
          Create your first project and let AI break it into tasks and assign your team — or join an
          existing project with an invite code.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center">
          <Link
            id="create-project-cta"
            href="/projects/new"
            className="flex items-center gap-2 rounded-full bg-toxic px-6 py-3 text-sm font-bold text-toxic-foreground hover:bg-toxic/90 hover:scale-[1.02] active:scale-95 transition-all shadow-[0_0_20px_rgba(57,255,20,0.25)]"
          >
            <Plus className="h-4 w-4" />
            Create a Project
          </Link>
          <Link
            id="join-project-cta"
            href="/join"
            className="flex items-center gap-2 rounded-full border border-border bg-transparent px-6 py-3 text-sm font-semibold text-foreground hover:border-toxic/30 hover:text-toxic transition-all"
          >
            <Hash className="h-4 w-4" />
            Join a Project
          </Link>
        </div>
      </div>
    </motion.div>
  );
}
