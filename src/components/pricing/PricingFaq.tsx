"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Do I need a credit card to sign up?",
    a: "No. Paceup does not require a credit card for the free tier. You only need to provide an API key from your chosen AI provider, and you pay them directly for usage.",
  },
  {
    q: "I don't have an API key. What do I do?",
    a: "Getting one takes about two minutes. When you sign up for Paceup, we provide step-by-step instructions on how to generate an API key from OpenAI or Anthropic. Both providers offer small amounts of free credits to get started.",
  },
  {
    q: "Will this stay free for students?",
    a: "Yes. The core BYOAI tier will always remain free. We built Paceup to help student teams and hackathon groups ship faster, and that mission requires keeping the barrier to entry at $0.",
  },
];

interface FaqItemProps {
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}

function FaqItem({ question, answer, isOpen, onClick }: FaqItemProps) {
  return (
    <div className="border-b border-border last:border-0">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={onClick}
        className="flex w-full items-center justify-between py-5 text-left gap-4 group"
      >
        <span className="text-base font-semibold text-foreground group-hover:text-toxic transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`h-5 w-5 flex-shrink-0 text-muted-foreground transition-transform duration-300 ${
            isOpen ? "rotate-180 text-toxic" : ""
          }`}
        />
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <p className="pb-5 text-muted-foreground leading-relaxed">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-24 sm:py-32 bg-background relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-12">
            Pricing FAQ
          </h2>
          <div className="rounded-2xl border border-border bg-card px-6 sm:px-8 divide-y-0">
            {faqs.map((faq, i) => (
              <FaqItem
                key={i}
                question={faq.q}
                answer={faq.a}
                isOpen={openIndex === i}
                onClick={() => handleToggle(i)}
              />
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
