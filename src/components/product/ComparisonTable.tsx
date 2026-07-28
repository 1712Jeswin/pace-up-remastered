"use client";

import { motion } from "framer-motion";
import { Check, Minus } from "lucide-react";

const rows = [
  { label: "Assigns tasks automatically", paceup: true, trello: false, notion: false, jira: false },
  { label: "Explains AI reasoning", paceup: true, trello: false, notion: false, jira: false },
  { label: "Tracks individual ownership", paceup: true, trello: true, notion: false, jira: true },
  { label: "Detects blockers proactively", paceup: true, trello: false, notion: false, jira: false },
  { label: "Automated daily standups", paceup: true, trello: false, notion: false, jira: false },
  { label: "Free with your own AI key", paceup: true, trello: false, notion: false, jira: false },
  { label: "Integrates with GitHub", paceup: true, trello: true, notion: false, jira: true },
  { label: "No AI lock-in (BYOAI)", paceup: true, trello: false, notion: false, jira: false },
];

const columns = ["paceup", "trello", "notion", "jira"] as const;
type Column = (typeof columns)[number];

const colHeaders: Record<Column, string> = {
  paceup: "Paceup",
  trello: "Trello",
  notion: "Notion",
  jira: "Jira",
};

function Cell({ value, highlight }: { value: boolean; highlight: boolean }) {
  return (
    <td className={`px-4 py-4 text-center ${highlight ? "bg-toxic/5" : ""}`}>
      {value ? (
        <Check className={`h-5 w-5 mx-auto ${highlight ? "text-toxic" : "text-muted-foreground/50"}`} />
      ) : (
        <Minus className="h-5 w-5 mx-auto text-muted-foreground/30" />
      )}
    </td>
  );
}

export function ComparisonTable() {
  return (
    <section className="py-24 sm:py-32 bg-muted/20 border-y border-border/50 relative z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <h2 className="text-3xl sm:text-4xl font-heading font-bold text-foreground text-center mb-4">
            How we compare
          </h2>
          <p className="text-center text-muted-foreground mb-12">
            Paceup was built for a different job than task boards.
          </p>
          <div className="overflow-x-auto rounded-2xl border border-border shadow-lg">
            <table className="min-w-full">
              <thead className="bg-card">
                <tr>
                  <th className="px-4 py-4 text-left text-sm font-semibold text-muted-foreground w-1/3">
                    Feature
                  </th>
                  {columns.map((col) => (
                    <th
                      key={col}
                      className={`px-4 py-4 text-center text-sm font-bold ${
                        col === "paceup"
                          ? "text-toxic bg-toxic/10"
                          : "text-muted-foreground"
                      }`}
                    >
                      {colHeaders[col]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((row, i) => (
                  <tr key={i} className="bg-card hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 text-sm font-medium text-foreground">
                      {row.label}
                    </td>
                    {columns.map((col) => (
                      <Cell key={col} value={row[col]} highlight={col === "paceup"} />
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
