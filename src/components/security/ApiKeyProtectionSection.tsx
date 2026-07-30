"use client";

import { motion, Variants } from "framer-motion";
import { ArrowRight, Lock, Zap, Eye } from "lucide-react";

interface Step {
  icon: React.ElementType;
  step: string;
  label: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    icon: ArrowRight,
    step: "01",
    label: "You enter your key",
    detail: "Pasted once into a masked input field. Never shown again after saving.",
  },
  {
    icon: Lock,
    step: "02",
    label: "Encrypted before storage",
    detail:
      "Your key is immediately encrypted using envelope encryption — a unique per-user data key wrapped by a master key. The plaintext is never written to disk or logged anywhere.",
  },
  {
    icon: Zap,
    step: "03",
    label: "Used only when needed",
    detail:
      "When you trigger an AI action, the key is decrypted in memory for that single request, then discarded. Never cached, never re-logged, never sent to the client.",
  },
];

const stepVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function ApiKeyProtectionSection() {
  return (
    <section className="py-20 bg-background border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-14"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-toxic mb-3">
            API Key Protection
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
            Your key is a one-way trip.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Once saved, your API key cannot be retrieved or displayed — not by you, not by us. This is
            a deliberate security decision, not a UX limitation.
          </p>
        </motion.div>

        {/* 3-step visual */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.12 } } }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-8 mb-10"
        >
          {STEPS.map((step) => (
            <motion.div
              key={step.step}
              variants={stepVariants}
              className="flex flex-col items-center sm:items-start text-center sm:text-left gap-4"
            >
              <div className="relative flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-card border border-toxic/30 shadow-[0_0_15px_rgba(57,255,20,0.1)]">
                <step.icon className="h-6 w-6 text-toxic" />
                <span className="absolute -top-2 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-toxic text-[10px] font-bold text-toxic-foreground">
                  {step.step}
                </span>
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-foreground text-sm">{step.label}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.detail}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* Never re-displayed callout */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="flex items-start gap-3 rounded-xl border border-border bg-card/50 px-5 py-4"
        >
          <Eye className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Never re-displayed.</span>{" "}
            After saving your key, the field shows a masked placeholder. There is no &quot;reveal&quot; button
            — by design. If you lose your key, generate a new one from your AI provider and re-save it.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
