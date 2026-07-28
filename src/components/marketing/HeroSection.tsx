"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { motionPresets } from "@/lib/motion";
import { ArrowRight } from "lucide-react";

export function HeroSection() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: motionPresets.easing.easeOutCubic
      }
    },
  };

  return (
    <section className="relative z-10 flex min-h-screen flex-col items-center justify-center px-4 pt-20 text-center sm:px-6 lg:px-8">
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-4xl"
      >
        <motion.h1 
          variants={item}
          className="font-heading text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1]"
        >
          AI that <span className="text-toxic drop-shadow-[0_0_15px_rgba(57,255,20,0.4)]">leads your team</span>,
          <br className="hidden sm:block" /> not just organizes it.
        </motion.h1>
        
        <motion.p 
          variants={item}
          className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground sm:text-xl leading-relaxed"
        >
          Because the real problem with project management isn't a lack of organization—it's the absence of leadership.
        </motion.p>
        
        <motion.div 
          variants={item}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          <Link
            href="/signup"
            className="group flex w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-toxic px-8 py-4 text-base font-semibold text-toxic-foreground transition-all hover:bg-toxic/90 hover:scale-[1.02] active:scale-95 shadow-[0_0_20px_rgba(57,255,20,0.2)] hover:shadow-[0_0_30px_rgba(57,255,20,0.4)]"
          >
            Start a Project — Free
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
          
          <Link
            href="#how-it-works"
            className="flex w-full sm:w-auto items-center justify-center rounded-full border border-border bg-card/50 backdrop-blur-sm px-8 py-4 text-base font-semibold text-foreground transition-all hover:bg-muted hover:border-muted-foreground/30 hover:scale-[1.02] active:scale-95"
          >
            See How It Works
          </Link>
        </motion.div>
      </motion.div>
    </section>
  );
}
