"use client";

import { motion, Variants } from "framer-motion";
import { KeyRound, BrainCircuit, Cpu, Trash2 } from "lucide-react";

interface PromiseItem {
  icon: React.ElementType;
  headline: string;
  detail: string;
}

const PROMISES: PromiseItem[] = [
  {
    icon: KeyRound,
    headline: "Keys encrypted, never shown again",
    detail:
      "Your API key is encrypted before it ever touches our database. We cannot retrieve it in plaintext — and neither can you after saving.",
  },
  {
    icon: BrainCircuit,
    headline: "Your code never trains any model",
    detail:
      "We do not use your project content, code, or documents to fine-tune or improve any AI model. Your data stays yours.",
  },
  {
    icon: Cpu,
    headline: "You choose your own AI provider",
    detail:
      "Paceup never acts as an AI middleman. You connect directly to Google Gemini, OpenAI, Anthropic, or any supported provider.",
  },
  {
    icon: Trash2,
    headline: "Delete your data anytime",
    detail:
      "You can request full account and project data deletion at any time. We do not retain ghost records or backups after deletion.",
  },
];

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export function CorePromisesStrip() {
  return (
    <section className="py-20 bg-card/30 border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="text-center text-xs font-bold uppercase tracking-widest text-toxic mb-12"
        >
          Core Promises
        </motion.p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {PROMISES.map((item) => (
            <motion.div
              key={item.headline}
              variants={itemVariants}
              className="group relative rounded-2xl border border-toxic/20 bg-card p-6 flex flex-col gap-4 hover:border-toxic/40 hover:shadow-[0_0_20px_rgba(57,255,20,0.08)] transition-all duration-300"
            >
              <div className="absolute top-0 left-0 w-1 h-12 rounded-tl-2xl bg-gradient-to-b from-toxic to-transparent" />

              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-toxic/10 border border-toxic/20">
                <item.icon className="h-5 w-5 text-toxic" />
              </div>

              <div className="space-y-2">
                <h3 className="text-sm font-semibold text-foreground leading-snug">
                  {item.headline}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {item.detail}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
