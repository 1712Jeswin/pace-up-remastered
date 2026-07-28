"use client";

import { motion, useScroll, useMotionValueEvent } from "framer-motion";
import { useState } from "react";
import Link from "next/link";
import { motionPresets } from "@/lib/motion";

export function SiteNav() {
  const { scrollY } = useScroll();
  const [isScrolled, setIsScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 20);
  });

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: motionPresets.easing.easeOutCubic }}
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-300 ${
        isScrolled ? "bg-background/80 backdrop-blur-md border-b border-border/50 shadow-sm" : "bg-transparent border-b border-transparent"
      }`}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <span className="text-2xl font-heading font-bold tracking-tight text-foreground transition-colors group-hover:text-toxic">
              pace<span className="text-toxic">up</span>
            </span>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-8">
            <Link href="/product" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              How It Works
            </Link>
            <Link href="/pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Pricing
            </Link>
            <Link href="/security" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Security
            </Link>
          </nav>

          {/* Auth Actions */}
          <div className="flex items-center gap-4">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-foreground hover:text-toxic transition-colors">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-toxic px-5 py-2 text-sm font-semibold text-toxic-foreground transition-all hover:bg-toxic/90 hover:scale-[1.02] active:scale-95"
            >
              Start a Project
            </Link>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
