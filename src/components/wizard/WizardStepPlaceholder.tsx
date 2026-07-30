"use client";

import type { WizardStep } from "@/types/wizard";

interface WizardStepPlaceholderProps {
  step: WizardStep;
}

// ─── Icon SVGs per step ────────────────────────────────────────────────────────
// These are inline placeholders only — real step content is built in Phase 14+.

const STEP_ICONS: Record<number, React.ReactNode> = {
  0: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
      <path d="M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v0a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v0Z" />
      <path d="M12 11h4M12 15h2" />
    </svg>
  ),
  1: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Z" />
      <path d="M14 2v6h6" />
      <path d="m8 16 2-2 2 2 4-4" />
    </svg>
  ),
  2: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9l-7-7Z" />
      <path d="M13 2v7h7" />
    </svg>
  ),
  3: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  4: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M12 2a8 8 0 0 1 8 8c0 5.25-8 13-8 13S4 15.25 4 10a8 8 0 0 1 8-8Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  ),
  5: (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  ),
};

export function WizardStepPlaceholder({ step }: WizardStepPlaceholderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center min-h-[300px]">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-toxic/20 bg-toxic/5 text-toxic">
        {STEP_ICONS[step.index] ?? null}
      </div>
      <h2 className="font-heading text-2xl font-bold text-foreground mb-3">
        {step.heading}
      </h2>
      <p className="text-muted-foreground text-sm max-w-sm leading-relaxed">
        {step.description}
      </p>
      {/* TODO: Replace with real step content in Phase 14+ */}
      <div className="mt-8 w-full max-w-sm space-y-3">
        <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
        <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />
        {step.index === 0 && <div className="h-10 rounded-xl bg-muted/50 animate-pulse" />}
      </div>
    </div>
  );
}
