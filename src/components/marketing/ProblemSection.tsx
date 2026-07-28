"use client";

import { motion, Variants } from "framer-motion";
import { AlertCircle, Clock, Users, Bug, XCircle } from "lucide-react";

const problems = [
  { icon: Clock, text: "Deadlines missed because tasks were ambiguous" },
  { icon: Users, text: "Nobody owns the bugs, so they sit in the backlog forever" },
  { icon: Bug, text: "Important edge cases discovered during the release" },
  { icon: XCircle, text: "Lack of clear technical direction stalls the entire team" },
];

export function ProblemSection() {
  const container: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const item: Variants = {
    hidden: { opacity: 0, y: 30 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
  };

  return (
    <section className="py-24 sm:py-32 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
            The familiar signs of a leaderless project.
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            We've all been there. It's not a tool problem.
          </p>
        </div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-6"
        >
          {problems.map((problem, i) => (
            <motion.div
              key={i}
              variants={item}
              className="flex items-start gap-4 p-6 rounded-2xl border border-destructive/20 bg-gradient-to-br from-destructive/5 to-amber-500/5 shadow-sm"
            >
              <div className="flex-shrink-0 mt-1">
                <problem.icon className="h-6 w-6 text-destructive/80" />
              </div>
              <p className="text-foreground font-medium text-lg leading-snug">
                {problem.text}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
