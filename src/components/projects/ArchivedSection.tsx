"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Archive } from "lucide-react";
import { ProjectCard } from "./ProjectCard";
import type { ProjectCardData } from "@/types/project";

interface ArchivedSectionProps {
  projects: ProjectCardData[];
}

export function ArchivedSection({ projects }: ArchivedSectionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (projects.length === 0) return null;

  return (
    <div className="border-t border-border pt-8">
      <button
        id="archived-section-toggle"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors mb-4"
        aria-expanded={isOpen}
      >
        <Archive className="h-4 w-4" />
        <span>Archived Projects</span>
        <span className="ml-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium">
          {projects.length}
        </span>
        <motion.span
          animate={{ rotate: isOpen ? 90 : 0 }}
          transition={{ duration: 0.2 }}
          className="ml-auto"
        >
          <ChevronRight className="h-4 w-4" />
        </motion.span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 pt-2 opacity-60">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
