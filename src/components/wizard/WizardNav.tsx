"use client";

import { ArrowLeft } from "lucide-react";

interface WizardNavProps {
  isFirstStep: boolean;
  isLastStep: boolean;
  isSkippable: boolean;
  canContinue: boolean;
  onBack: () => void;
  onContinue: () => void;
  onSkip: () => void;
}

export function WizardNav({
  isFirstStep,
  isLastStep,
  isSkippable,
  canContinue,
  onBack,
  onContinue,
  onSkip,
}: WizardNavProps) {
  return (
    <div className="flex items-center justify-between gap-4 pt-6 mt-6 border-t border-border">
      {/* Back */}
      <button
        id="wizard-back"
        onClick={onBack}
        disabled={isFirstStep}
        aria-label="Go to previous step"
        className="flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold text-muted-foreground border border-transparent hover:border-border hover:text-foreground disabled:pointer-events-none disabled:opacity-0 transition-all"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="flex items-center gap-3">
        {/* Skip — only visible on skippable steps */}
        {isSkippable && (
          <button
            id="wizard-skip"
            onClick={onSkip}
            className="rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip for now
          </button>
        )}

        {/* Continue / Finish */}
        <button
          id="wizard-continue"
          onClick={onContinue}
          disabled={!canContinue}
          className="rounded-full bg-toxic px-7 py-2.5 text-sm font-bold text-toxic-foreground hover:bg-toxic/90 hover:scale-[1.02] active:scale-95 disabled:opacity-40 disabled:pointer-events-none disabled:scale-100 transition-all shadow-[0_0_16px_rgba(57,255,20,0.2)]"
        >
          {isLastStep ? "Create Project" : "Continue"}
        </button>
      </div>
    </div>
  );
}
