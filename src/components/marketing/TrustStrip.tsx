"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ShieldCheck, Key, Cpu } from "lucide-react";

const trustItems = [
  { icon: Cpu, text: "Bring Your Own AI (BYOAI)" },
  { icon: Key, text: "Keys Encrypted at Rest" },
  { icon: ShieldCheck, text: "Zero Code Training" },
];

export function TrustStrip() {
  return (
    <section className="py-12 bg-background border-b border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="flex flex-col sm:flex-row items-center justify-center gap-8 sm:gap-16"
        >
          {trustItems.map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <item.icon className="h-5 w-5 text-toxic" />
              <span className="text-sm font-medium text-foreground">{item.text}</span>
            </div>
          ))}
          
          <Link 
            href="/security" 
            className="text-sm font-medium text-muted-foreground hover:text-toxic underline underline-offset-4 transition-colors ml-0 sm:ml-4"
          >
            Read our Security Docs →
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
