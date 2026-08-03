"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, RefreshCw } from "lucide-react";
import { AiThinking } from "@/components/ai/AiThinking";

// ─── Constants ────────────────────────────────────────────────────────────────

// Poll every 3 seconds — fast enough to feel live, cheap enough to not abuse the DB
const POLL_INTERVAL_MS = 3000;

const AI_STATUS_LINES = [
  "Reading your project brief...",
  "Identifying modules...",
  "Matching skills to tasks...",
  "Balancing workload across your team...",
  "Writing task rationales...",
  "Generating milestones...",
  "Finalising your breakdown...",
];

type JobStatus = "pending" | "running" | "complete" | "failed";

interface StatusResponse {
  status: JobStatus;
  errorMessage?: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

interface BreakdownPollingShellProps {
  projectId: string;
  /** Initial status fetched server-side — prevents a flash of "pending" on load. */
  initialStatus: JobStatus;
}

export function BreakdownPollingShell({ projectId, initialStatus }: BreakdownPollingShellProps) {
  const router = useRouter();
  const [status, setStatus] = useState<JobStatus>(initialStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/breakdown/${projectId}/status`, {
        // No-cache: we want fresh data every poll cycle
        cache: "no-store",
      });

      if (!res.ok) return; // Network hiccup — silently retry next cycle

      const data = (await res.json()) as StatusResponse;
      setStatus(data.status);

      if (data.status === "failed") {
        setErrorMessage(data.errorMessage ?? "The AI breakdown failed unexpectedly.");
      }

      if (data.status === "complete") {
        // Phase 23 will build the actual review page — for now redirect to the project root
        // which Phase 23 will intercept via a redirect in the breakdown page server component
        router.push(`/projects/${projectId}/breakdown/review`);
      }
    } catch {
      // Network error — silently absorb and retry next tick
    }
  }, [projectId, router]);

  useEffect(() => {
    // Don't poll if we're already in a terminal state
    if (status === "complete" || status === "failed") return;

    // Immediate first poll
    poll();

    const interval = setInterval(poll, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, poll]);

  // ── Retry (failed state) ───────────────────────────────────────────────────
  const handleRetry = async () => {
    setIsRetrying(true);
    setErrorMessage(null);

    try {
      const res = await fetch(`/api/breakdown/${projectId}/retry`, {
        method: "POST",
      });
      if (res.ok) {
        setStatus("pending");
      } else {
        setErrorMessage("Failed to restart the breakdown. Try refreshing the page.");
      }
    } catch {
      setErrorMessage("Network error. Please refresh and try again.");
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-16">
      <AnimatePresence mode="wait">
        {status !== "failed" ? (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-lg text-center"
          >
            <AiThinking statusLines={AI_STATUS_LINES} className="py-10">
              <p className="mt-4 text-sm text-muted-foreground">
                This usually takes 15–60 seconds depending on team size.
              </p>
            </AiThinking>
          </motion.div>
        ) : (
          <motion.div
            key="error"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-md rounded-2xl border border-destructive/30 bg-destructive/5 p-8 text-center"
          >
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <h2 className="font-heading text-xl font-bold text-foreground mb-2">
              Breakdown Failed
            </h2>
            <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
              {errorMessage ?? "Something went wrong while generating your project breakdown."}
            </p>
            <p className="text-xs text-muted-foreground mb-6">
              This is often caused by an invalid or rate-limited API key.
            </p>
            <button
              type="button"
              onClick={handleRetry}
              disabled={isRetrying}
              className="inline-flex items-center gap-2 rounded-xl bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRetrying ? "animate-spin" : ""}`} />
              {isRetrying ? "Restarting..." : "Try Again"}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
