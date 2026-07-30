"use client";

import { motion, Variants } from "framer-motion";
import { HardDrive, Send, AlertCircle } from "lucide-react";

const ITEMS = [
  {
    icon: HardDrive,
    title: "Where your files live",
    body: "Uploaded documents and code files are stored in Supabase Storage in a team-scoped bucket. Only authenticated members of your project can access them — we do not mix files across teams.",
  },
  {
    icon: Send,
    title: "When files are sent to your AI provider",
    body: "File content is only forwarded to your chosen AI provider when you explicitly trigger an AI action (such as generating a task breakdown or reviewing a submission). Files are never passively scanned or indexed in the background.",
  },
  {
    icon: AlertCircle,
    title: "Third-party provider data retention",
    body: "Once content reaches your AI provider, their own data retention and privacy policies apply. We cannot make guarantees about third-party behavior. Check your chosen provider's terms directly — most major providers offer a zero-data-retention option for API customers.",
  },
];

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

export function DataHandlingSection() {
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
            Uploaded Content & Documents
          </p>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground mb-4 leading-tight">
            Your files, on your terms.
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl">
            What happens to files you upload — and when they actually leave our system.
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }}
          className="flex flex-col gap-5"
        >
          {ITEMS.map((item) => (
            <motion.div
              key={item.title}
              variants={itemVariants}
              className="flex gap-5 items-start rounded-2xl border border-border bg-card p-6 hover:border-border/80 transition-colors"
            >
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted border border-border">
                <item.icon className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="space-y-1.5">
                <h3 className="font-semibold text-foreground text-sm">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.body}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
