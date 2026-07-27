import { BotMessageSquare } from "lucide-react";

interface AiRationaleCalloutProps {
  /** The rationale text — e.g. "Assigned to Priya because she listed React as Comfortable." */
  children: React.ReactNode;
  /** Optional extra class names for the container */
  className?: string;
}

/**
 * AiRationaleCallout — an indented inline block explaining why the AI made a decision.
 * Uses a green left border with mono/italic text treatment. Static, no animation.
 */
export function AiRationaleCallout({
  children,
  className = "",
}: AiRationaleCalloutProps) {
  return (
    <div
      className={`flex gap-2.5 pl-3 border-l-2 border-toxic/60 bg-toxic/5 rounded-r-md py-2 pr-3 ${className}`}
    >
      <BotMessageSquare className="h-4 w-4 text-toxic/70 mt-0.5 shrink-0" />
      <p className="text-sm font-mono italic text-muted-foreground leading-relaxed">
        {children}
      </p>
    </div>
  );
}
