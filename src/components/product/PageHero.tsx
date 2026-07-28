"use client";

import { motion } from "framer-motion";

interface PageHeroProps {
  title: string;
  subtitle: string;
}

export function PageHero({ title, subtitle }: PageHeroProps) {
  return (
    <section className="py-24 sm:py-32 text-center bg-background border-b border-border/50 relative z-10 overflow-hidden">
      {/* Subtle ambient glow */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-[60vw] h-[30vw] rounded-full bg-toxic/5 filter blur-[100px]" />
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="mt-5 text-xl text-muted-foreground max-w-2xl mx-auto">
            {subtitle}
          </p>
        </motion.div>
      </div>
    </section>
  );
}
