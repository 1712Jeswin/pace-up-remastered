"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RefreshCw, CheckCircle, AlertCircle } from "lucide-react";
import { regenerateBreakdownAction, confirmBreakdownAction } from "@/app/actions/breakdown";

// ─── Max feedback note length — must match server action validation ──────────
const MAX_FEEDBACK_CHARS = 300;

interface RegeneratePanelProps {
  projectId: string;
}

export function RegeneratePanel({ projectId }: RegeneratePanelProps) {
  const router = useRouter();
  const [feedbackNote, setFeedbackNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [isRegenerating, startRegenerate] = useTransition();
  const [isConfirming, startConfirm] = useTransition();

  function handleRegenerate() {
    setError(null);
    startRegenerate(async () => {
      const result = await regenerateBreakdownAction({
        projectId,
        feedbackNote: feedbackNote.trim() || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      // Redirect back to loading screen to show the new job's progress
      router.push(`/projects/${projectId}/breakdown`);
    });
  }

  function handleConfirm() {
    setError(null);
    startConfirm(async () => {
      try {
        await confirmBreakdownAction(projectId);
        // confirmBreakdownAction performs a server-side redirect — this line is
        // only reached if something unexpected happens.
      } catch (err) {
        // next/navigation redirect() throws internally — this is expected behaviour
        if (err instanceof Error && err.message !== "NEXT_REDIRECT") {
          setError(err.message);
        }
      }
    });
  }

  const charsLeft = MAX_FEEDBACK_CHARS - feedbackNote.length;
  const isNearLimit = charsLeft < 50;

  return (
    <div className="rounded-2xl border border-border/40 bg-card/60 p-6 flex flex-col gap-5">
      {/* Section header */}
      <div>
        <h3 className="text-sm font-semibold text-foreground">Not quite right?</h3>
        <p className="text-xs text-muted-foreground mt-0.5">
          Tell the AI what to change, or confirm the breakdown to start your project.
        </p>
      </div>

      {/* Feedback textarea */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          What should be different? <span className="normal-case">(optional)</span>
        </label>
        <textarea
          value={feedbackNote}
          onChange={(e) => setFeedbackNote(e.target.value.slice(0, MAX_FEEDBACK_CHARS))}
          rows={3}
          placeholder="e.g. Split the auth module into two, assign more backend tasks to Alex..."
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-toxic/30 transition resize-none"
        />
        <span className={`text-right text-[10px] font-mono ${isNearLimit ? "text-amber-400" : "text-muted-foreground/50"}`}>
          {charsLeft} chars left
        </span>
      </div>

      {/* Error message */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        {/* Regenerate */}
        <button
          type="button"
          onClick={handleRegenerate}
          disabled={isRegenerating || isConfirming}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/60 bg-muted/20 px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/40 hover:text-foreground disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${isRegenerating ? "animate-spin" : ""}`} />
          {isRegenerating ? "Regenerating..." : "Regenerate Breakdown"}
        </button>

        {/* Confirm & Start — primary CTA */}
        <button
          type="button"
          onClick={handleConfirm}
          disabled={isConfirming || isRegenerating}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-toxic px-6 py-2.5 text-sm font-bold text-background shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:shadow-[0_0_30px_rgba(57,255,20,0.5)] hover:opacity-90 disabled:opacity-40"
        >
          <CheckCircle className="h-4 w-4" />
          {isConfirming ? "Starting project..." : "Confirm & Start Project"}
        </button>
      </div>
    </div>
  );
}
