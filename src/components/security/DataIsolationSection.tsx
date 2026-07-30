"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, Users, Lock } from "lucide-react";

const ISOLATION_POINTS = [
  {
    icon: ShieldCheck,
    title: "Project-scoped access only",
    body: "Project data — tasks, standups, submissions, team profiles, and AI breakdowns — is scoped to individual projects. A member of Project A has no visibility into Project B, even within the same organisation.",
  },
  {
    icon: Users,
    title: "Role-based permissions",
    body: "Within a project, Owners have full administrative access. Members can read project data and act within their assigned scope. No member can access another member's API key configuration.",
  },
  {
    icon: Lock,
    title: "No cross-team data bleed",
    body: "Paceup does not aggregate, compare, or expose project data across different teams or organisations. Your project intelligence stays inside your project.",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, x: -16 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function DataIsolationSection() {
  return (
    <section className="py-20 bg-background border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-toxic mb-3">
            Data Isolation
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
            Teams stay separate. Always.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Access control is enforced at every layer — not just in the UI, but in every database query.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {ISOLATION_POINTS.map((point) => (
            <motion.div
              key={point.title}
              variants={itemVariants}
              className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:border-info/30 transition-colors"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-info/10 border border-info/20">
                <point.icon className="h-4 w-4 text-info" />
              </div>
              <div className="space-y-2">
                <h3 className="font-semibold text-foreground text-sm">{point.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{point.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
