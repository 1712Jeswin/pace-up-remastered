"use client";

import { motion } from "framer-motion";
import { Mail, Bug } from "lucide-react";

const CONTACT_OPTIONS = [
  {
    icon: Mail,
    label: "General security questions",
    address: "security@paceup.app",
    description: "Questions about our practices, key encryption, data handling, or privacy policies.",
  },
  {
    icon: Bug,
    label: "Report a vulnerability",
    address: "security@paceup.app",
    description:
      "Found a security issue? Please report it responsibly to this address with a description and reproduction steps. We take all reports seriously and respond promptly.",
  },
];

export function SecurityContactSection() {
  return (
    <section className="py-20 bg-card/20 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-toxic mb-3">
            Contact
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
            Questions or concerns?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            We take security and privacy seriously. If something looks wrong or you have a question that
            this page does not answer, reach out directly.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {CONTACT_OPTIONS.map((option) => (
            <motion.div
              key={option.label}
              variants={{
                hidden: { opacity: 0, y: 16 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
              }}
              className="rounded-2xl border border-border bg-card p-6 space-y-4 hover:border-toxic/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-toxic/10 border border-toxic/20">
                  <option.icon className="h-4 w-4 text-toxic" />
                </div>
                <h3 className="font-semibold text-foreground text-sm">{option.label}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{option.description}</p>
              <a
                href={`mailto:${option.address}`}
                className="inline-block text-sm font-semibold text-toxic hover:underline transition-colors"
              >
                {option.address} →
              </a>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
