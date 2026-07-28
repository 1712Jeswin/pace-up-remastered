"use client";

import { motion } from "framer-motion";

export function SocialProofSection() {
  return (
    <section className="py-24 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-3xl border border-border bg-muted/30 p-12 text-center"
        >
          <p className="text-muted-foreground text-sm uppercase tracking-widest font-semibold mb-6">
            Trusted by modern engineering teams
          </p>
          <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 opacity-50 grayscale">
            {/* Placeholders for logos */}
            <div className="h-8 w-24 bg-foreground/20 rounded-md" />
            <div className="h-8 w-32 bg-foreground/20 rounded-md" />
            <div className="h-8 w-28 bg-foreground/20 rounded-md" />
            <div className="h-8 w-20 bg-foreground/20 rounded-md" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
