"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  FileText,
  Code2,
  FolderOpen,
  Users,
  Cpu,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ChevronRight,
  Calendar,
  Tag,
  Shield,
} from "lucide-react";
import { createProjectAction } from "@/app/actions/create-project";
import type { WizardStepProps } from "@/types/wizard";

// ─── Provider display names ───────────────────────────────────────────────────

const PROVIDER_NAMES: Record<string, string> = {
  gemini: "Google Gemini",
  openai: "OpenAI",
  anthropic: "Anthropic",
  openrouter: "OpenRouter",
  groq: "Groq",
};

const POLICY_LABELS: Record<string, string> = {
  owner_key: "Owner key shared",
  per_member_key: "Each member uses own key",
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

interface ReviewStepProps extends WizardStepProps {
  /** Callback to jump back to a specific step index */
  onNavigateToStep: (index: number) => void;
}

export function ReviewStep({ step, formData, setCanContinue, onNavigateToStep }: ReviewStepProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Validate required fields to gate Create button
  const isValid =
    formData.title.trim().length > 0 &&
    formData.type !== "" &&
    formData.deadline.trim().length > 0;

  useEffect(() => {
    setCanContinue(isValid);
  }, [isValid, setCanContinue]);

  const handleCreate = useCallback(async () => {
    setIsCreating(true);
    setCreateError(null);

    const result = await createProjectAction(formData);

    if (result.success) {
      // Redirect immediately — the breakdown page shows AI Thinking state
      router.push(`/projects/${result.projectId}/breakdown`);
    } else {
      setIsCreating(false);
      setCreateError(result.error);
    }
  }, [formData, router]);

  const deadline = formData.deadline
    ? new Date(formData.deadline).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : null;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      <div className="space-y-4">
        {/* ── Step 1: Project Details ────────────────────────────────────── */}
        <ReviewSection
          icon={<FileText className="h-4 w-4" />}
          title="Project Details"
          stepIndex={0}
          onEdit={onNavigateToStep}
        >
          <div className="space-y-2">
            {formData.title ? (
              <p className="text-sm font-semibold text-foreground">{formData.title}</p>
            ) : (
              <p className="text-sm text-destructive flex items-center gap-1.5">
                <AlertCircle className="h-3.5 w-3.5" /> Title is required
              </p>
            )}
            <div className="flex flex-wrap gap-3 mt-2">
              {formData.type && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Tag className="h-3 w-3" />
                  {formData.type}
                </span>
              )}
              {deadline && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {deadline}
                </span>
              )}
            </div>
            {formData.problemStatement && (
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed line-clamp-2">
                {formData.problemStatement}
              </p>
            )}
          </div>
        </ReviewSection>

        {/* ── Step 2: Tech Stack ────────────────────────────────────────── */}
        <ReviewSection
          icon={<Code2 className="h-4 w-4" />}
          title="Tech Stack"
          stepIndex={1}
          onEdit={onNavigateToStep}
        >
          {formData.techStack.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {formData.techStack.map((tech) => (
                <span
                  key={tech}
                  className="rounded-full border border-toxic/30 bg-toxic/10 px-3 py-1 text-xs font-medium text-toxic"
                >
                  {tech}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground italic">No technologies added</p>
          )}
        </ReviewSection>

        {/* ── Step 3: Documents ─────────────────────────────────────────── */}
        <ReviewSection
          icon={<FolderOpen className="h-4 w-4" />}
          title="Supporting Documents"
          stepIndex={2}
          onEdit={onNavigateToStep}
        >
          {formData.uploadedDocuments.length > 0 ? (
            <ul className="space-y-1.5">
              {formData.uploadedDocuments.map((doc) => (
                <li key={doc.storagePath} className="flex items-center gap-2 text-xs text-foreground">
                  <FileText className="h-3 w-3 text-muted-foreground shrink-0" />
                  {doc.name}
                  <span className="text-muted-foreground ml-auto">
                    {(doc.sizeBytes / 1024).toFixed(0)} KB
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">No documents uploaded (optional)</p>
          )}
        </ReviewSection>

        {/* ── Step 4: Team ──────────────────────────────────────────────── */}
        <ReviewSection
          icon={<Users className="h-4 w-4" />}
          title="Invited Team Members"
          stepIndex={3}
          onEdit={onNavigateToStep}
        >
          {formData.stagedInvites.length > 0 ? (
            <ul className="space-y-2">
              {formData.stagedInvites.map((invite) => (
                <li key={invite.userId} className="flex items-center gap-2">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground overflow-hidden">
                    {invite.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={invite.image} alt={invite.name} className="h-6 w-6 object-cover" />
                    ) : (
                      invite.name.charAt(0).toUpperCase()
                    )}
                  </div>
                  <span className="text-sm text-foreground">{invite.name}</span>
                  <span className="text-xs text-muted-foreground">@{invite.handle}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-muted-foreground italic">No invites sent (you can add members later)</p>
          )}
        </ReviewSection>

        {/* ── Step 5: AI Provider ───────────────────────────────────────── */}
        <ReviewSection
          icon={<Cpu className="h-4 w-4" />}
          title="AI Provider"
          stepIndex={4}
          onEdit={onNavigateToStep}
        >
          {formData.providerKey?.isSaved ? (
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-4 w-4 text-toxic shrink-0" />
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {PROVIDER_NAMES[formData.providerKey.provider] ?? formData.providerKey.provider}
                </p>
                <p className="text-xs text-muted-foreground flex items-center gap-1.5 mt-0.5">
                  <Shield className="h-3 w-3" />
                  Key encrypted ·{" "}
                  {POLICY_LABELS[formData.providerKey.policy] ?? formData.providerKey.policy}
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-xs text-yellow-500">
              <AlertCircle className="h-3.5 w-3.5 shrink-0" />
              No API key connected — AI features will be unavailable until you add one.
            </div>
          )}
        </ReviewSection>
      </div>

      {/* Missing required fields warning */}
      {!isValid && (
        <div className="mt-5 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          <span>
            Step 1 is incomplete. Please{" "}
            <button
              type="button"
              onClick={() => onNavigateToStep(0)}
              className="font-semibold underline hover:no-underline"
            >
              go back and fill in the required fields
            </button>{" "}
            before creating the project.
          </span>
        </div>
      )}

      {/* Create error */}
      {createError && (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {createError}
        </div>
      )}

      {/* Overrides the WizardNav Continue button — shown inline here during creation */}
      {isCreating && (
        <div className="mt-6 flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Creating your project...
        </div>
      )}

      {/* Expose handleCreate so WizardShell can call it on "Create Project" click */}
      {/* This is triggered by setting the onContinue override via useEffect */}
      <button
        id="create-project-trigger"
        type="button"
        className="sr-only"
        onClick={handleCreate}
        aria-hidden="true"
        tabIndex={-1}
      />
    </div>
  );
}
