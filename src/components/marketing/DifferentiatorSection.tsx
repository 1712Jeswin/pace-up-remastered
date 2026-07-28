"use client";

import { motion } from "framer-motion";

export function DifferentiatorSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/20 border-y border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-6">
            Why not just use Trello or Notion?
          </h2>
          <p className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-foreground leading-tight">
            Because boards don't build software.
            <br className="hidden sm:block" />
            <span className="text-toxic drop-shadow-[0_0_10px_rgba(57,255,20,0.3)]">Active leadership does.</span>
          </p>
        </motion.div>
      </div>
    </section>
  );
}
