"use client";

import { motion } from "framer-motion";
import { Bot, LineChart, Bell, MessagesSquare } from "lucide-react";

const features = [
  {
    id: "ai-assignment",
    title: "AI Task Assignment",
    description: "The AI understands your team's unique strengths and availability, automatically routing the right tasks to the right developers. No more manual backlog grooming.",
    icon: Bot,
    reverse: false,
  },
  {
    id: "daily-standups",
    title: "Asynchronous Daily Standups",
    description: "Stop wasting time in meetings. Paceup's AI agent conducts personalized 1-on-1 check-ins with your team, aggregates the updates, and highlights blockers automatically.",
    icon: MessagesSquare,
    reverse: true,
  },
  {
    id: "progress-dashboard",
    title: "Real-time Progress Dashboard",
    description: "Get a bird's-eye view of your project's health. The AI identifies bottlenecks before they become critical and suggests immediate course corrections.",
    icon: LineChart,
    reverse: false,
  },
  {
    id: "smart-reminders",
    title: "Smart Reminders & Nudges",
    description: "Gentle, context-aware nudges for overdue tasks or pending PR reviews, so you don't have to be the bad guy nagging your team.",
    icon: Bell,
    reverse: true,
  }
];

export function FeatureHighlightsSection() {
  return (
    <section className="py-24 sm:py-32 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="space-y-32">
          {features.map((feature, i) => (
            <div 
              key={feature.id}
              className={`flex flex-col gap-12 lg:gap-20 items-center ${
                feature.reverse ? "lg:flex-row-reverse" : "lg:flex-row"
              }`}
            >
              {/* Text Content */}
              <motion.div 
                initial={{ opacity: 0, x: feature.reverse ? 30 : -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="flex-1 space-y-6 text-center lg:text-left"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-toxic/10 border border-toxic/20">
                  <feature.icon className="h-6 w-6 text-toxic" />
                </div>
                <h3 className="text-3xl font-heading font-bold text-foreground">
                  {feature.title}
                </h3>
                <p className="text-lg text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>

              {/* Visual/Screenshot Placeholder */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="flex-1 w-full"
              >
                <div className="aspect-video w-full rounded-2xl border border-border bg-card shadow-2xl overflow-hidden flex items-center justify-center relative">
                  {/* Subtle grid pattern inside placeholder */}
                  <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center opacity-[0.03]" />
                  <div className="text-muted-foreground font-mono text-sm opacity-50">
                    // [Mock Component: {feature.id}]
                  </div>
                </div>
              </motion.div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
