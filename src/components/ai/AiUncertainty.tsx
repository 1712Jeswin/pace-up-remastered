import { AlertTriangle } from "lucide-react";

interface AiUncertaintyProps {
  /** The content being flagged as low-confidence */
  children: React.ReactNode;
  /** Optional label override — defaults to "Low confidence" */
  label?: string;
  /** Optional extra class names for the container */
  className?: string;
}

/**
 * AiUncertainty — wraps content that the AI is not confident about.
 * Uses a dashed border with desaturated/muted styling and a "Low confidence" tag.
 */
export function AiUncertainty({
  children,
  label = "Low confidence",
  className = "",
}: AiUncertaintyProps) {
  return (
    <div
      className={`rounded-lg border border-dashed border-muted-foreground/40 bg-muted/30 p-4 ${className}`}
    >
      {/* Low confidence badge */}
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle className="h-3.5 w-3.5 text-muted-foreground" />
        <span className="text-xs font-mono text-muted-foreground">{label}</span>
      </div>

      {/* Content rendered with muted styling */}
      <div className="text-muted-foreground/80">{children}</div>
    </div>
  );
}
