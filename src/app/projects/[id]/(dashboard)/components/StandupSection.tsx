"use client";

import { useState, useTransition } from "react";
import { Sparkles, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { submitCheckinAction } from "@/app/actions/standup";
import { AiGeneratedContent } from "@/components/ai/AiGeneratedContent";

// ─── Max lengths — must match server action validation ─────────────────────────
const MAX_UPDATE_CHARS = 500;
const MAX_BLOCKERS_CHARS = 300;

// ─── Types ────────────────────────────────────────────────────────────────────

interface CheckedInMember {
  userId: string;
  name: string;
  image: string | null;
  update: string;
  blockers: string | null;
}

interface PendingMember {
  userId: string;
  name: string;
  image: string | null;
}

interface StandupSectionProps {
  projectId: string;
  currentUserId: string;
  /** Members who have already checked in today */
  checkedIn: CheckedInMember[];
  /** Members who have NOT checked in today */
  pending: PendingMember[];
  /** AI-generated summary — null until Phase 34 writes it */
  aiSummary: string | null;
}

// ─── Avatar helpers ───────────────────────────────────────────────────────────

function MemberAvatar({
  name,
  image,
  hasCheckedIn,
}: {
  name: string;
  image: string | null;
  hasCheckedIn: boolean;
}) {
  return (
    <div className="group relative">
      {/* Avatar circle */}
      <div
        className={`h-10 w-10 rounded-full overflow-hidden border-2 transition-all ${
          hasCheckedIn
            ? "border-toxic shadow-[0_0_8px_rgba(57,255,20,0.35)]"
            : "border-border/60"
        }`}
      >
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-muted text-xs font-bold text-muted-foreground">
            {name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {/* Status indicator dot */}
      {hasCheckedIn ? (
        <CheckCircle className="absolute -bottom-1 -right-1 h-4 w-4 text-toxic bg-background rounded-full" />
      ) : (
        <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-400" />
        </span>
      )}

      {/* Tooltip */}
      <div className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md border border-border/60 bg-card px-2 py-1 text-[10px] font-medium text-foreground opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 shadow-md">
        {name}
        {hasCheckedIn ? " ✓" : " (pending)"}
      </div>
    </div>
  );
}

// ─── Inline Check-In Form ─────────────────────────────────────────────────────

function CheckInForm({
  projectId,
  onSuccess,
}: {
  projectId: string;
  onSuccess: () => void;
}) {
  const [update, setUpdate] = useState("");
  const [blockers, setBlockers] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await submitCheckinAction({
        projectId,
        update,
        blockers: blockers || undefined,
      });

      if (!result.success) {
        setError(result.error);
        return;
      }

      onSuccess();
    });
  }

  const updateCharsLeft = MAX_UPDATE_CHARS - update.length;
  const blockersCharsLeft = MAX_BLOCKERS_CHARS - blockers.length;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3">
      {/* Update field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          What are you working on today? <span className="text-destructive">*</span>
        </label>
        <textarea
          value={update}
          onChange={(e) => setUpdate(e.target.value.slice(0, MAX_UPDATE_CHARS))}
          rows={2}
          required
          autoFocus
          placeholder="e.g. Finishing the auth middleware, reviewing PR #12..."
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-toxic/30 transition resize-none"
        />
        <span className={`text-right text-[10px] font-mono ${updateCharsLeft < 80 ? "text-amber-400" : "text-muted-foreground/40"}`}>
          {updateCharsLeft}
        </span>
      </div>

      {/* Blockers field */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Any blockers? <span className="text-muted-foreground/50">(optional)</span>
        </label>
        <textarea
          value={blockers}
          onChange={(e) => setBlockers(e.target.value.slice(0, MAX_BLOCKERS_CHARS))}
          rows={1}
          placeholder="e.g. Waiting on API credentials from Alex..."
          className="rounded-xl border border-border/60 bg-muted/20 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-2 focus:ring-toxic/30 transition resize-none"
        />
        <span className={`text-right text-[10px] font-mono ${blockersCharsLeft < 50 ? "text-amber-400" : "text-muted-foreground/40"}`}>
          {blockersCharsLeft}
        </span>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2">
          <AlertCircle className="h-4 w-4 text-destructive shrink-0" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={!update.trim() || isPending}
          className="inline-flex items-center gap-2 rounded-xl bg-toxic px-5 py-2.5 text-sm font-bold text-background shadow-[0_0_16px_rgba(57,255,20,0.25)] transition-all hover:shadow-[0_0_24px_rgba(57,255,20,0.4)] hover:opacity-90 disabled:opacity-40"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            "Check In"
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Main StandupSection ──────────────────────────────────────────────────────

export function StandupSection({
  projectId,
  currentUserId,
  checkedIn,
  pending,
  aiSummary,
}: StandupSectionProps) {
  const [hasJustCheckedIn, setHasJustCheckedIn] = useState(false);

  const isCurrentUserPending =
    !hasJustCheckedIn && pending.some((m) => m.userId === currentUserId);

  const totalCount = checkedIn.length + pending.length;
  const checkedInCount = checkedIn.length + (hasJustCheckedIn ? 1 : 0);

  return (
    <section className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-foreground">Today's Standup</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            {checkedInCount} of {totalCount} members checked in
          </p>
        </div>
      </div>

      {/* Member Status Row */}
      <div className="flex flex-wrap items-center gap-4">
        {/* Checked-in members */}
        {checkedIn.map((m) => (
          <MemberAvatar key={m.userId} name={m.name} image={m.image} hasCheckedIn={true} />
        ))}

        {/* Current user — optimistically shown as checked in after form submit */}
        {hasJustCheckedIn &&
          (() => {
            const me = pending.find((m) => m.userId === currentUserId);
            return me ? (
              <MemberAvatar key={me.userId} name={me.name} image={me.image} hasCheckedIn={true} />
            ) : null;
          })()}

        {/* Pending members (excluding current user if just checked in) */}
        {pending
          .filter((m) => !(hasJustCheckedIn && m.userId === currentUserId))
          .map((m) => (
            <MemberAvatar key={m.userId} name={m.name} image={m.image} hasCheckedIn={false} />
          ))}
      </div>

      {/* Inline Check-In Form — only visible if current user hasn't checked in */}
      <AnimatePresence>
        {isCurrentUserPending && (
          <motion.div
            key="checkin-form"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="rounded-2xl border border-border/40 bg-card/60 p-5 flex flex-col gap-4"
          >
            <p className="text-sm font-medium text-foreground">
              You haven't checked in yet today.
            </p>
            <CheckInForm
              projectId={projectId}
              onSuccess={() => setHasJustCheckedIn(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success banner after optimistic check-in */}
      <AnimatePresence>
        {hasJustCheckedIn && (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 rounded-xl border border-toxic/20 bg-toxic/5 px-4 py-2.5 text-sm text-toxic"
          >
            <CheckCircle className="h-4 w-4 shrink-0" />
            You're checked in for today!
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Team Summary */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-3.5 w-3.5 text-toxic" />
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-widest">
            Team Summary
          </span>
        </div>

        {aiSummary ? (
          <AiGeneratedContent>
            <p className="text-sm text-foreground leading-relaxed">{aiSummary}</p>
          </AiGeneratedContent>
        ) : (
          <div className="rounded-xl border border-dashed border-border/40 bg-muted/10 px-5 py-4">
            <p className="text-xs text-muted-foreground/60 italic leading-relaxed">
              Team summary will appear once enough members have checked in today.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
