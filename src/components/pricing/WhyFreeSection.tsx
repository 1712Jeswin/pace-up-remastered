"use client";

import { motion } from "framer-motion";
import { Key, Bot, LayoutTemplate, ArrowRight } from "lucide-react";

export function WhyFreeSection() {
  return (
    <section className="py-24 sm:py-32 bg-muted/20 border-y border-border/50 relative z-10 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center"
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-6">
            Why is Paceup free?
          </h2>
          <p className="text-lg text-muted-foreground mb-16 max-w-2xl mx-auto leading-relaxed">
            We use a Bring Your Own AI (BYOAI) model. Instead of paying us a monthly subscription that marks up the cost of AI, you connect your own API key. You pay your AI provider directly at their standard rate (usually pennies per project), and use our platform for free.
          </p>

          {/* Visual Flow */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mb-12">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-lg">
                <Key className="h-7 w-7 text-muted-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">1. Your API Key</span>
            </div>

            <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground/50" />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-lg">
                <Bot className="h-7 w-7 text-toxic" />
              </div>
              <span className="text-sm font-semibold text-foreground">2. AI Provider</span>
              <span className="text-xs text-muted-foreground -mt-2">(OpenAI, Anthropic)</span>
            </div>

            <ArrowRight className="hidden sm:block h-5 w-5 text-muted-foreground/50" />

            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-card border border-border shadow-lg">
                <LayoutTemplate className="h-7 w-7 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground">3. Paceup App</span>
            </div>
          </div>

          <div className="rounded-xl border border-toxic/20 bg-toxic/5 p-6 max-w-2xl mx-auto text-left flex items-start gap-4">
            <div className="flex-shrink-0 mt-1 text-toxic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
            </div>
            <div>
              <h4 className="text-sm font-bold text-foreground mb-1">Usage Limits</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Paceup does not limit how many projects you can create or tasks you can manage. Your usage is only limited by your chosen AI provider's limits or credits.
              </p>
            </div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
