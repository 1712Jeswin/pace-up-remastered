"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTA() {
  return (
    <section className="py-24 sm:py-32 bg-background relative z-10 overflow-hidden border-t border-border">
      {/* Subtle glow effect behind CTA */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0">
        <div className="w-[50vw] h-[50vw] rounded-full bg-toxic/5 filter blur-[150px]" />
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col items-center"
        >
          <h2 className="text-4xl sm:text-5xl font-heading font-extrabold text-foreground tracking-tight mb-6">
            Ready to let AI lead?
          </h2>
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl">
            Stop organizing tasks and start shipping features.
          </p>
          <Link
            href="/signup"
            className="group flex items-center justify-center gap-2 rounded-full bg-toxic px-10 py-5 text-lg font-bold text-toxic-foreground transition-all hover:bg-toxic/90 hover:scale-[1.02] active:scale-95 shadow-[0_0_30px_rgba(57,255,20,0.3)] hover:shadow-[0_0_50px_rgba(57,255,20,0.5)]"
          >
            Start a Project — Free
            <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
