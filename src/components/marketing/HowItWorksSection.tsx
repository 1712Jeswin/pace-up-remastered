"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { FolderPlus, BrainCircuit, Users, Target } from "lucide-react";

const steps = [
  { icon: FolderPlus, title: "Create", desc: "Define your high-level goal or feature." },
  { icon: BrainCircuit, title: "AI Breaks It Down", desc: "The AI agent generates a structured technical plan." },
  { icon: Users, title: "Team Gets Assigned", desc: "Tasks are matched to your team's specific skills." },
  { icon: Target, title: "AI Keeps You On Track", desc: "Automated daily standups and blocker resolution." },
];

export function HowItWorksSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start center", "end center"],
  });

  // The connecting line draws in
  const lineWidth = useTransform(scrollYProgress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="py-24 sm:py-32 bg-muted/20 relative z-10 overflow-hidden border-y border-border/50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-20">
          <h2 className="text-3xl sm:text-4xl font-heading font-bold tracking-tight text-foreground">
            How Paceup Works
          </h2>
          <p className="mt-4 text-muted-foreground text-lg">
            A workflow built around active AI leadership.
          </p>
        </div>

        <div ref={containerRef} className="relative">
          {/* Connecting Line (Background) */}
          <div className="absolute top-12 left-[10%] right-[10%] h-1 bg-border rounded-full hidden md:block" />
          
          {/* Connecting Line (Foreground Animated) */}
          <motion.div 
            className="absolute top-12 left-[10%] h-1 bg-toxic rounded-full hidden md:block shadow-[0_0_10px_rgba(57,255,20,0.5)] origin-left"
            style={{ width: lineWidth }}
          />

          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-4 relative z-10">
            {steps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="flex items-center justify-center h-24 w-24 rounded-full bg-card border-2 border-border mb-6 group-hover:border-toxic group-hover:shadow-[0_0_20px_rgba(57,255,20,0.2)] transition-all duration-300 relative">
                  {/* Outer ring animation on hover */}
                  <div className="absolute inset-0 rounded-full border border-toxic opacity-0 group-hover:animate-ping" />
                  <step.icon className="h-10 w-10 text-foreground group-hover:text-toxic transition-colors duration-300" />
                </div>
                <h3 className="text-xl font-bold font-heading mb-2 text-foreground">{step.title}</h3>
                <p className="text-muted-foreground text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
