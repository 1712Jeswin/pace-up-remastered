"use client";

import { motion } from "framer-motion";
import { Check, Info } from "lucide-react";
import Link from "next/link";

const freeFeatures = [
  "Unlimited projects",
  "AI task breakdown",
  "Automated standups",
  "Smart reminders",
  "Progress dashboard",
  "Basic risk flags",
];

export function PricingCards() {
  return (
    <section className="py-24 sm:py-32 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          
          {/* Card 1: Free Tier (Emphasized) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="relative flex flex-col rounded-3xl border-2 border-toxic/50 bg-card p-8 shadow-[0_0_40px_rgba(57,255,20,0.1)] scale-100 md:scale-105 z-10"
          >
            <div className="mb-6">
              <h3 className="text-2xl font-heading font-bold text-foreground">
                Free — Student/Team
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Bring your own AI key. Everything you need to manage your project.
              </p>
            </div>
            
            <div className="mb-8">
              <span className="text-5xl font-extrabold text-foreground tracking-tight">$0</span>
              <span className="text-muted-foreground font-medium ml-2">forever</span>
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {freeFeatures.map((feature, i) => (
                <li key={i} className="flex items-center gap-3">
                  <div className="flex-shrink-0 h-5 w-5 rounded-full bg-toxic/20 flex items-center justify-center">
                    <Check className="h-3 w-3 text-toxic" />
                  </div>
                  <span className="text-sm font-medium text-foreground">{feature}</span>
                </li>
              ))}
            </ul>

            <Link
              href="/signup"
              className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-toxic text-toxic-foreground font-bold hover:bg-toxic/90 transition-colors"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Card 2: Managed AI (Muted/Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="relative flex flex-col rounded-3xl border border-dashed border-border/50 bg-card/30 p-8 opacity-70 saturate-50"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border">
              Coming Soon
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-heading font-bold text-foreground">
                Managed AI
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                No API keys required. We bundle premium AI models directly into your plan.
              </p>
            </div>
            
            <div className="mb-8">
              <span className="text-3xl font-extrabold text-foreground tracking-tight line-through opacity-50">TBD</span>
            </div>

            <div className="space-y-4 mb-8 flex-1 text-sm text-muted-foreground">
              <p>Everything in Free, plus:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  Built-in access to GPT-4o and Claude 3.5 Sonnet
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  Usage-based unified billing
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  Priority support
                </li>
              </ul>
            </div>

            <button disabled className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed border border-border/50">
              Waitlist
            </button>
          </motion.div>

          {/* Card 3: University / Teams (Muted/Coming Soon) */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="relative flex flex-col rounded-3xl border border-dashed border-border/50 bg-card/30 p-8 opacity-70 saturate-50"
          >
            <div className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-muted px-3 py-1 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-border">
              Coming Soon
            </div>
            <div className="mb-6">
              <h3 className="text-xl font-heading font-bold text-foreground">
                University / Teams
              </h3>
              <p className="text-muted-foreground mt-2 text-sm">
                Custom data processing agreements, centralized billing, and analytics.
              </p>
            </div>
            
            <div className="mb-8">
              <span className="text-lg font-bold text-foreground tracking-tight">Custom Pricing</span>
            </div>

            <div className="space-y-4 mb-8 flex-1 text-sm text-muted-foreground">
              <p>Everything in Managed AI, plus:</p>
              <ul className="space-y-3">
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  SSO & Advanced Security
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  Organization-wide analytics
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-muted-foreground mt-0.5">•</span>
                  Dedicated account manager
                </li>
              </ul>
            </div>

            <button disabled className="w-full inline-flex items-center justify-center h-12 rounded-xl bg-muted text-muted-foreground font-bold cursor-not-allowed border border-border/50">
              Contact Us
            </button>
          </motion.div>

        </div>
      </div>
    </section>
  );
}
