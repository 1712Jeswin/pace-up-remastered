"use client";

import { motion } from "framer-motion";
import { GraduationCap } from "lucide-react";

export function UniversityCallout() {
  return (
    <section className="py-20 bg-background border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="rounded-2xl border border-warning/30 bg-warning/5 p-8 flex flex-col sm:flex-row gap-6 items-start"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-warning/10 border border-warning/30">
            <GraduationCap className="h-6 w-6 text-warning" />
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold uppercase tracking-widest text-warning">
              For Universities &amp; Instructors
            </p>
            <h2 className="text-2xl font-heading font-bold text-foreground">
              Institutional data agreements — coming soon.
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              We are planning formal Data Processing Agreements (DPAs) for universities and academic
              institutions that wish to deploy Paceup in an official instructional context. If you are an
              instructor or IT administrator exploring Paceup for your institution, please reach out —
              we will work with you directly.
            </p>
            <p className="text-muted-foreground text-sm leading-relaxed max-w-2xl">
              In the meantime, student usage on the free tier is governed by our standard Terms of Service
              and this Privacy page. No special institutional agreement is required for individual student
              sign-ups.
            </p>
            <a
              href="mailto:security@paceup.app"
              className="inline-block mt-2 text-sm font-semibold text-warning hover:underline transition-colors"
            >
              Contact us about institutional agreements →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
