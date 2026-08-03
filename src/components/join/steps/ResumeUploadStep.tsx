"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Upload,
  FileText,
  X,
  AlertCircle,
  Loader2,
  Star,
  CheckCircle2,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AiThinking } from "@/components/ai/AiThinking";
import { AiGeneratedContent } from "@/components/ai/AiGeneratedContent";
import { uploadResumeAction, parseResumeAction, deleteResumeAction } from "@/app/actions/resume";
import type { JoinStepProps } from "@/types/join";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.txt";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB

const AI_STATUS_LINES = [
  "Reading your resume...",
  "Extracting relevant experience...",
  "Identifying project skills...",
  "Summarising your background...",
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface UploadedFileChipProps {
  fileName: string;
  sizeBytes: number;
  isRemoving: boolean;
  onRemove: () => void;
}

function UploadedFileChip({ fileName, sizeBytes, isRemoving, onRemove }: UploadedFileChipProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.2 }}
      className="flex items-center gap-3 rounded-xl border border-toxic/30 bg-toxic/5 px-4 py-3"
    >
      <FileText className="h-4 w-4 shrink-0 text-toxic" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{fileName}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(sizeBytes)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${fileName}`}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 transition-colors"
      >
        {isRemoving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </motion.div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

interface ResumeUploadStepProps extends JoinStepProps {
  projectId: string;
}

type ParseState = "idle" | "uploading" | "parsing" | "done" | "error";

export function ResumeUploadStep({
  step,
  formData,
  updateForm,
  setCanContinue,
  projectId,
}: ResumeUploadStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [parseState, setParseState] = useState<ParseState>("idle");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isRemoving, setIsRemoving] = useState(false);
  // Local editable copy of the AI summary so edits don't trigger re-renders of formData
  const [editableSummary, setEditableSummary] = useState(formData.resumeSummary ?? "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This step is skippable — never block progress
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  // Sync editable summary back to formData when user stops typing
  const handleSummaryChange = (value: string) => {
    setEditableSummary(value);
    updateForm({ resumeSummary: value });
  };

  // ── File processing ────────────────────────────────────────────────────────

  const processFile = useCallback(
    async (file: File) => {
      setUploadError(null);

      // Client-side size guard before hitting the network
      if (file.size > MAX_SIZE_BYTES) {
        setUploadError(`"${file.name}" is too large. Maximum size is 10 MB.`);
        return;
      }

      // ── 1. Upload ──────────────────────────────────────────────────────────
      setParseState("uploading");

      const fd = new FormData();
      fd.append("file", file);
      fd.append("projectId", projectId);

      const uploadResult = await uploadResumeAction(fd);

      if (!uploadResult.success) {
        setUploadError(uploadResult.error);
        setParseState("error");
        return;
      }

      // Persist the storage path immediately so Skip can clean it up
      updateForm({ resumeStoragePath: uploadResult.storagePath });

      // ── 2. Parse (AI extraction) ───────────────────────────────────────────
      setParseState("parsing");

      const parseResult = await parseResumeAction(uploadResult.storagePath, projectId);

      if (!parseResult.success) {
        setUploadError(parseResult.error);
        setParseState("error");
        return;
      }

      setEditableSummary(parseResult.summary);
      updateForm({
        resumeSummary: parseResult.summary,
        resumeStoragePath: uploadResult.storagePath,
      });
      setParseState("done");
    },
    [projectId, updateForm]
  );

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemove = useCallback(async () => {
    if (!formData.resumeStoragePath) return;
    setIsRemoving(true);
    setUploadError(null);

    const result = await deleteResumeAction(formData.resumeStoragePath, projectId);

    if (result.success) {
      updateForm({ resumeStoragePath: undefined, resumeSummary: undefined });
      setEditableSummary("");
      setParseState("idle");
    } else {
      setUploadError(result.error);
    }

    setIsRemoving(false);
  }, [formData.resumeStoragePath, projectId, updateForm]);

  // ── Drag events ────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (parseState === "uploading" || parseState === "parsing") return;
    const files = Array.from(e.dataTransfer.files);
    if (files[0]) processFile(files[0]);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    // Reset so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const isBusy = parseState === "uploading" || parseState === "parsing";
  const hasUpload = parseState === "done" && formData.resumeStoragePath;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── Heading ─────────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      {/* ── "Highly Recommended" badge ──────────────────────────────────────── */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
        <Star className="h-4 w-4 shrink-0 text-amber-400 mt-0.5" />
        <p className="text-xs leading-relaxed">
          <span className="font-semibold text-amber-400">Highly Recommended.</span>{" "}
          <span className="text-muted-foreground">
            Your resume helps the AI assign tasks that match your actual experience — not just
            your listed skills.
          </span>
        </p>
      </div>

      {/* ── Upload zone (hidden once a file is uploaded) ─────────────────────── */}
      <AnimatePresence mode="wait">
        {!hasUpload && !isBusy && (
          <motion.div
            key="upload-zone"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div
              role="button"
              tabIndex={0}
              aria-label="Upload resume"
              onClick={() => fileInputRef.current?.click()}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click();
              }}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-all cursor-pointer select-none ${
                isDragOver
                  ? "border-amber-400 bg-amber-400/5 shadow-[0_0_24px_rgba(251,191,36,0.1)]"
                  : "border-border bg-card hover:border-amber-400/50 hover:bg-amber-400/5"
              }`}
            >
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${
                  isDragOver
                    ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                    : "border-border bg-muted/40 text-muted-foreground"
                }`}
              >
                <Upload className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">
                  {isDragOver ? "Drop to upload" : "Drag your resume here or click to browse"}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  PDF, Word, or TXT · Max 10 MB
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ACCEPTED_EXTENSIONS}
                className="sr-only"
                aria-hidden="true"
                onChange={handleFileInputChange}
              />
            </div>
          </motion.div>
        )}

        {/* ── AI Thinking state ──────────────────────────────────────────────── */}
        {isBusy && (
          <motion.div
            key="thinking"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            <AiThinking statusLines={AI_STATUS_LINES} className="py-6">
              <p className="text-sm text-muted-foreground text-center mt-2">
                {parseState === "uploading" ? "Uploading your resume..." : "Extracting experience..."}
              </p>
            </AiThinking>
          </motion.div>
        )}

        {/* ── Uploaded file chip + AI-generated summary ─────────────────────── */}
        {hasUpload && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            {/* File chip */}
            <UploadedFileChip
              fileName={formData.resumeStoragePath?.split("_").slice(1).join("_") ?? "resume"}
              sizeBytes={0}
              isRemoving={isRemoving}
              onRemove={handleRemove}
            />

            {/* AI-generated summary card */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-toxic" />
                <p className="text-sm font-semibold text-foreground">AI Experience Summary</p>
              </div>
              <AiGeneratedContent className="rounded-xl overflow-hidden">
                <textarea
                  id="resume-summary-edit"
                  value={editableSummary}
                  onChange={(e) => handleSummaryChange(e.target.value)}
                  rows={5}
                  placeholder="Your experience summary will appear here after parsing..."
                  className="w-full resize-none bg-transparent text-sm text-foreground leading-relaxed placeholder:text-muted-foreground/50 outline-none focus:ring-0 pt-4 pb-2"
                  aria-label="Edit AI-generated experience summary"
                />
              </AiGeneratedContent>
              <p className="text-xs text-muted-foreground">
                Feel free to edit this before continuing — it's saved as-is.
              </p>
            </div>

            {/* Reassurance line */}
            <div className="flex items-start gap-2 rounded-xl border border-border bg-muted/20 px-4 py-3">
              <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Only visible to your project owner and used to improve task matching.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Error message ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {uploadError && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive overflow-hidden"
          >
            <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            {uploadError}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
