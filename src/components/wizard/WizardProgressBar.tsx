"use client";

import { Check } from "lucide-react";
import type { WizardStep } from "@/types/wizard";

interface WizardProgressBarProps {
  steps: WizardStep[];
  currentIndex: number;
}

export function WizardProgressBar({ steps, currentIndex }: WizardProgressBarProps) {
  return (
    <div className="relative flex items-start justify-between w-full px-2">
      {/* Connecting line track — sits behind the dots */}
      <div className="absolute top-[14px] left-[calc(100%/12)] right-[calc(100%/12)] h-px bg-border z-0" />

      {steps.map((step) => {
        const isCompleted = step.index < currentIndex;
        const isCurrent = step.index === currentIndex;

        return (
          <div
            key={step.index}
            className="relative z-10 flex flex-col items-center gap-2"
            style={{ width: `${100 / steps.length}%` }}
          >
            {/* Segment fill — covers the connector line up to this dot */}
            {isCompleted && step.index > 0 && (
              <div
                className="absolute top-[14px] right-1/2 h-px bg-toxic z-0"
                style={{ width: "50%" }}
              />
            )}
            {isCurrent && step.index > 0 && (
              <div
                className="absolute top-[14px] right-1/2 h-px bg-toxic z-0"
                style={{ width: "50%" }}
              />
            )}
            {isCompleted && step.index < steps.length - 1 && (
              <div
                className="absolute top-[14px] left-1/2 h-px bg-toxic z-0"
                style={{ width: "50%" }}
              />
            )}

            {/* Dot */}
            <div
              className={`relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-[11px] font-bold transition-all duration-300 ${
                isCompleted
                  ? "border-toxic bg-toxic text-toxic-foreground"
                  : isCurrent
                  ? "border-toxic bg-toxic/10 text-toxic shadow-[0_0_12px_rgba(57,255,20,0.35)]"
                  : "border-border bg-card text-muted-foreground"
              }`}
            >
              {isCompleted ? (
                <Check className="h-3.5 w-3.5 stroke-[2.5]" />
              ) : (
                <span>{step.index + 1}</span>
              )}
            </div>

            {/* Label */}
            <span
              className={`text-center text-[10px] font-medium leading-tight hidden sm:block ${
                isCurrent
                  ? "text-toxic"
                  : isCompleted
                  ? "text-foreground/60"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
