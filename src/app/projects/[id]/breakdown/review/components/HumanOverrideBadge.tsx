import { Pencil } from "lucide-react";

interface HumanOverrideBadgeProps {
  className?: string;
}

/**
 * HumanOverrideBadge — replaces AiRationaleCallout when a task has been manually
 * edited or reassigned. Neutral styling (no green border) — signals human intent.
 */
export function HumanOverrideBadge({ className = "" }: HumanOverrideBadgeProps) {
  return (
    <div
      className={`flex items-center gap-2 pl-3 border-l-2 border-muted-foreground/30 bg-muted/20 rounded-r-md py-1.5 pr-3 ${className}`}
    >
      <Pencil className="h-3.5 w-3.5 text-muted-foreground/60 shrink-0" />
      <span className="text-xs font-mono italic text-muted-foreground/70">
        Manually adjusted
      </span>
    </div>
  );
}
