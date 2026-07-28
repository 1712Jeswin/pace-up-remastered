"use client";

import { motion, Variants } from "framer-motion";
import {
  Bot,
  MessagesSquare,
  LineChart,
  Bell,
  Shield,
  GitBranch,
  Users,
  Zap,
} from "lucide-react";

const features = [
  { icon: Bot, label: "AI Task Assignment" },
  { icon: MessagesSquare, label: "Async Standups" },
  { icon: LineChart, label: "Progress Dashboard" },
  { icon: Bell, label: "Smart Reminders" },
  { icon: Shield, label: "BYOAI & Encryption" },
  { icon: GitBranch, label: "GitHub Integration" },
  { icon: Users, label: "Team Management" },
  { icon: Zap, label: "Instant Planning" },
];

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07 },
  },
};

const item: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function ProductFeatureGrid() {
  return (
    <section className="py-24 sm:py-32 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-4">
          Everything in one place
        </h2>
        <p className="text-center text-muted-foreground mb-16">
          A complete project leadership toolkit, not just another task list.
        </p>
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-4"
        >
          {features.map(({ icon: Icon, label }) => (
            <motion.div
              key={label}
              variants={item}
              className="group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center transition-all hover:border-toxic/40 hover:bg-toxic/5 hover:shadow-[0_0_20px_rgba(57,255,20,0.07)]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-muted group-hover:bg-toxic/10 transition-colors">
                <Icon className="h-5 w-5 text-muted-foreground group-hover:text-toxic transition-colors" />
              </div>
              <span className="text-sm font-semibold text-foreground">{label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
