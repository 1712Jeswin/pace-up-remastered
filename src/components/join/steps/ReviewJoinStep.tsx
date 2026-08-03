"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Zap,
  Clock,
  Briefcase,
  Globe,
  FileText,
  User,
} from "lucide-react";
import { motion } from "framer-motion";
import { AiGeneratedContent } from "@/components/ai/AiGeneratedContent";
import { joinProjectAction } from "@/app/actions/join-project";
import type { JoinStepProps } from "@/types/join";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const CONFIDENCE_LABEL: Record<string, string> = {
  Comfortable: "Comfortable",
  Learning: "Learning",
};

// ─── Section shell ────────────────────────────────────────────────────────────

interface ReviewSectionProps {
  icon: React.ReactNode;
  title: string;
  stepIndex: number;
  onEdit: (stepIndex: number) => void;
  children: React.ReactNode;
}

function ReviewSection({ icon, title, stepIndex, onEdit, children }: ReviewSectionProps) {
  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-border/60">
        <div className="flex items-center gap-2.5">
          <span className="text-toxic">{icon}</span>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        </div>
        <button
          type="button"
          onClick={() => onEdit(stepIndex)}
          className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          Edit
          <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="px-5 py-4">{children}</div>
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

interface ReviewJoinStepProps extends JoinStepProps {
  projectId: string;
  inviteToken: string;
  /** Callback to navigate back to a specific step index */
  onNavigateToStep: (index: number) => void;
}

export function ReviewJoinStep({
  step,
  formData,
  setCanContinue,
  projectId,
  inviteToken,
  onNavigateToStep,
}: ReviewJoinStepProps) {
  const router = useRouter();
  const [isJoining, setIsJoining] = useState(false);
  const [joinError, setJoinError] = useState<string | null>(null);

  // The WizardNav Continue button is hidden on this step — the inline
  // "Join Project" button is the real gate. We signal canContinue=true
  // so the shell doesn't block, but the action fires from this component.
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const handleJoin = useCallback(async () => {
    setIsJoining(true);
    setJoinError(null);

    const result = await joinProjectAction(projectId, inviteToken, formData);

    if (result.success) {
      router.push(`/projects/${result.projectId}`);
    } else {
      setIsJoining(false);
      setJoinError(result.error);
    }
  }, [projectId, inviteToken, formData, router]);

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      <div className="space-y-4">
        {/* ── Step 1: Skills & Role ────────────────────────────────────────── */}
        <ReviewSection
          icon={<User className="h-4 w-4" />}
          title="Skills & Role"
          stepIndex={0}
          onEdit={onNavigateToStep}
        >
          <div className="space-y-3">
            {formData.rolePreference && (
              <p className="text-sm font-semibold text-foreground">
                Role:{" "}
                <span className="font-normal text-muted-foreground">
                  {formData.rolePreference}
                </span>
              </p>
            )}
            {formData.skills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {formData.skills.map((skill) => (
                  <span
                    key={skill.name}
                    className="flex items-center gap-1.5 rounded-full border border-toxic/30 bg-toxic/10 px-3 py-1 text-xs font-medium text-toxic"
                  >
                    {skill.name}
                    {skill.confidence !== "Comfortable" && (
                      <span className="text-muted-foreground font-normal">
                        · {CONFIDENCE_LABEL[skill.confidence] ?? skill.confidence}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground italic">No skills listed</p>
            )}
            {formData.interests && (
              <p className="text-xs text-muted-foreground leading-relaxed">
                Interests: {formData.interests}
              </p>
            )}
          </div>
        </ReviewSection>

        {/* ── Step 2: Availability ─────────────────────────────────────────── */}
        <ReviewSection
          icon={<Clock className="h-4 w-4" />}
          title="Availability"
          stepIndex={1}
          onEdit={onNavigateToStep}
        >
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="font-semibold text-foreground">{formData.weeklyHours}h</span>
              <span className="text-muted-foreground">per week</span>
            </div>
            {formData.otherProjects && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Briefcase className="h-3.5 w-3.5" />
                Working on another project concurrently
              </div>
            )}
            {formData.timezone && (
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Globe className="h-3.5 w-3.5" />
                {formData.timezone}
              </div>
            )}
          </div>
        </ReviewSection>

        {/* ── Step 3: Resume ────────────────────────────────────────────────── */}
        <ReviewSection
          icon={<FileText className="h-4 w-4" />}
          title="Resume & Experience"
          stepIndex={2}
          onEdit={onNavigateToStep}
        >
          {formData.resumeSummary ? (
            <AiGeneratedContent>
              <p className="text-sm text-foreground leading-relaxed pr-6">
                {formData.resumeSummary}
              </p>
            </AiGeneratedContent>
          ) : (
            <p className="text-xs text-muted-foreground italic">
              No resume added (the AI will rely on your listed skills only)
            </p>
          )}
        </ReviewSection>
      </div>

      {/* ── Join error ───────────────────────────────────────────────────────── */}
      {joinError && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.2 }}
          className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive overflow-hidden"
        >
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {joinError}
        </motion.div>
      )}

      {/* ── Join Project button ──────────────────────────────────────────────── */}
      <div className="mt-8">
        <button
          id="join-project-btn"
          type="button"
          onClick={handleJoin}
          disabled={isJoining}
          className="group relative w-full overflow-hidden rounded-xl bg-toxic px-6 py-3.5 text-sm font-semibold text-toxic-foreground transition-all hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-toxic/50 focus:ring-offset-2 focus:ring-offset-background"
        >
          {isJoining ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Joining project...
            </span>
          ) : (
            <span className="flex items-center justify-center gap-2">
              <Zap className="h-4 w-4" />
              Join Project
            </span>
          )}
          {/* Hover glow shimmer */}
          <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
        </button>

        <p className="mt-3 text-center text-xs text-muted-foreground">
          You can update your profile anytime from team settings.
        </p>
      </div>

      {/* Hidden trigger for WizardNav compatibility (WizardNav Continue is suppressed on this step) */}
      <button
        id="review-join-trigger"
        type="button"
        className="sr-only"
        onClick={handleJoin}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
