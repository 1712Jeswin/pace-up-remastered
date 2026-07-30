"use client";

import { motion } from "framer-motion";
import { Trash2 } from "lucide-react";

const DELETION_STEPS = [
  "Your account record and display name are permanently removed.",
  "All projects you own are archived immediately and permanently deleted after a 14-day grace period — giving collaborators time to export their own data.",
  "Projects where you are a member (not owner) are not deleted — your membership record is removed, but the project continues for remaining members.",
  "Your uploaded files are deleted from Supabase Storage.",
  "Your encrypted API key(s) are purged from our database.",
  "Anonymised standup/task contribution records may remain in aggregate stats for other members' own project history views — these contain no personal identifiers.",
];

export function AccountDeletionSection() {
  return (
    <section className="py-20 bg-card/20 border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mb-12"
        >
          <p className="text-xs font-bold uppercase tracking-widest text-toxic mb-3">
            Account & Data Deletion
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
            What happens when you delete your account.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            You can request account deletion from your account settings at any time. Here is exactly what
            happens, in order.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.08 } } }}
          className="flex flex-col gap-3 max-w-3xl"
        >
          {DELETION_STEPS.map((step, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, x: -12 },
                visible: { opacity: 1, x: 0, transition: { duration: 0.45, ease: "easeOut" } },
              }}
              className="flex items-start gap-4 rounded-xl border border-border bg-card px-5 py-4"
            >
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-[10px] font-bold">
                {i + 1}
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-8 flex items-start gap-3 rounded-xl border border-destructive/20 bg-destructive/5 px-5 py-4 max-w-3xl"
        >
          <Trash2 className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Deletion is permanent.</span>{" "}
            We do not retain soft-deleted shadows of your account or data after the deletion is
            processed. There is no recovery path once confirmed.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
