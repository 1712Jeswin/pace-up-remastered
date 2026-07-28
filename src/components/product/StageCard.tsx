"use client";

import { motion } from "framer-motion";

interface StageCardProps {
  stageId: string;
  label: string;
  reverse: boolean;
  title: string;
  description: string;
  detail: string;
  icon: React.ReactNode;
  mockContent: React.ReactNode;
}

export function StageCard({
  stageId,
  label,
  reverse,
  title,
  description,
  detail,
  icon,
  mockContent,
}: StageCardProps) {
  return (
    <div
      id={stageId}
      className={`flex flex-col gap-12 lg:gap-20 items-center ${
        reverse ? "lg:flex-row-reverse" : "lg:flex-row"
      }`}
    >
      {/* Text Side */}
      <motion.div
        initial={{ opacity: 0, x: reverse ? 30 : -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, ease: "easeOut" }}
        className="flex-1 space-y-5 text-center lg:text-left"
      >
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-toxic/10 border border-toxic/20">
          {icon}
        </div>
        <p className="text-xs font-bold uppercase tracking-widest text-toxic">
          {label}
        </p>
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground leading-tight">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
        <p className="text-sm text-muted-foreground/80 leading-relaxed">
          {detail}
        </p>
      </motion.div>

      {/* Visual / Mock Side */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.65, delay: 0.15, ease: "easeOut" }}
        className="flex-1 w-full"
      >
        <div className="relative aspect-[4/3] w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
          {/* Subtle inner grid */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(57,255,20,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(57,255,20,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
          <div className="relative z-10 h-full w-full flex items-center justify-center p-6">
            {mockContent}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
