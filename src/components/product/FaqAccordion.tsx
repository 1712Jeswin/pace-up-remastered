"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Does this replace me as a leader?",
    a: "No. Paceup acts as an execution layer — it handles the mechanical work of breaking down tasks, assigning them, and tracking progress. Strategic decisions, culture, and vision still belong to you. Think of it as a highly efficient team lead, not a replacement for your role.",
  },
  {
    q: "Do I need to pay for AI?",
    a: "Paceup operates on a Bring Your Own AI (BYOAI) model. You connect your own API key from a provider like OpenAI or Anthropic. The free tier gives you full access to all features, and you only pay your AI provider directly at their standard rate — often just cents per project.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your code, project data, and API keys are never used for training models. API keys are encrypted at rest using AES-256. We never have access to your AI provider account or your codebase beyond what the agent needs to do its job.",
  },
  {
    q: "What if the AI assigns something wrong?",
    a: "All task assignments are transparent and editable. The AI shows its reasoning for every decision — you can see why it assigned a task to a specific team member, and reassign it with one click. The AI will adapt and learn from your changes within the project context.",
  },
  {
    q: "Can I use this for hackathons?",
    a: "Absolutely — this is one of the best use cases. Spin up a project, paste in your problem statement, and Paceup will generate a complete technical plan with tasks assigned to your team members in minutes. It was designed with time-boxed, high-intensity projects in mind.",
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

export function FaqAccordion() {
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
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Everything you need to know before getting started.
          </p>
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
