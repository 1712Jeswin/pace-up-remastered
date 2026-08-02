"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Upload, FileText, X, AlertCircle, Loader2 } from "lucide-react";
import { uploadDocumentAction, deleteDocumentAction } from "@/app/actions/documents";
import type { WizardStepProps, UploadedDocument } from "@/types/wizard";

// ─── Constants ────────────────────────────────────────────────────────────────

const ACCEPTED_EXTENSIONS = ".pdf,.doc,.docx,.ppt,.pptx,.txt,.md";
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_COUNT = 10;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// ─── Document chip ────────────────────────────────────────────────────────────

interface DocumentChipProps {
  doc: UploadedDocument;
  isRemoving: boolean;
  onRemove: () => void;
}

function DocumentChip({ doc, isRemoving, onRemove }: DocumentChipProps) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 transition-all">
      <FileText className="h-4 w-4 shrink-0 text-toxic" />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
        <p className="text-xs text-muted-foreground">{formatBytes(doc.sizeBytes)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        disabled={isRemoving}
        aria-label={`Remove ${doc.name}`}
        className="shrink-0 flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-50 transition-colors"
      >
        {isRemoving ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <X className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

interface UploadingFile {
  id: string;
  name: string;
}

export function SupportingDocsStep({ step, formData, updateForm, setCanContinue }: WizardStepProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState<UploadingFile[]>([]);
  const [removingPaths, setRemovingPaths] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // This step is always skippable — never block progress
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const uploadedDocuments = formData.uploadedDocuments ?? [];
  const isAtLimit = uploadedDocuments.length >= MAX_FILE_COUNT;

  // ── File processing ────────────────────────────────────────────────────────

  const processFiles = useCallback(
    async (files: File[]) => {
      setError(null);

      // Guard: check slot availability
      const availableSlots = MAX_FILE_COUNT - uploadedDocuments.length;
      const toProcess = files.slice(0, availableSlots);

      if (files.length > availableSlots) {
        setError(`You can upload a maximum of ${MAX_FILE_COUNT} documents.`);
      }

      for (const file of toProcess) {
        // Client-side size check before hitting the network
        if (file.size > MAX_SIZE_BYTES) {
          setError(`"${file.name}" is too large. Maximum size is 10 MB.`);
          continue;
        }

        const uploadId = `${file.name}-${Date.now()}`;
        setUploading((prev) => [...prev, { id: uploadId, name: file.name }]);

        const fd = new FormData();
        fd.append("file", file);

        const result = await uploadDocumentAction(fd);

        setUploading((prev) => prev.filter((u) => u.id !== uploadId));

        if (result.success) {
          updateForm({
            uploadedDocuments: [...uploadedDocuments, result.document],
          });
        } else {
          setError(result.error);
        }
      }
    },
    [uploadedDocuments, updateForm]
  );

  // ── Remove ─────────────────────────────────────────────────────────────────

  const handleRemove = useCallback(
    async (doc: UploadedDocument) => {
      setRemovingPaths((prev) => new Set(prev).add(doc.storagePath));

      const result = await deleteDocumentAction(doc.storagePath);

      if (result.success) {
        updateForm({
          uploadedDocuments: uploadedDocuments.filter(
            (d) => d.storagePath !== doc.storagePath
          ),
        });
      } else {
        setError(result.error);
      }

      setRemovingPaths((prev) => {
        const next = new Set(prev);
        next.delete(doc.storagePath);
        return next;
      });
    },
    [uploadedDocuments, updateForm]
  );

  // ── Drag events ────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear if the leave target is outside the drop zone
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (isAtLimit) return;
    const files = Array.from(e.dataTransfer.files);
    processFiles(files);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) processFiles(files);
    // Reset input so selecting the same file again triggers onChange
    e.target.value = "";
  };

  const isUploading = uploading.length > 0;

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          {step.heading}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      {/* Optional nudge */}
      <div className="mb-6 flex items-start gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
        <span className="text-base leading-none mt-0.5">💡</span>
        <p className="text-xs text-muted-foreground leading-relaxed">
          <span className="font-semibold text-foreground">This step is optional.</span>{" "}
          Adding docs helps the AI create a more accurate task breakdown for your project.
        </p>
      </div>

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={isAtLimit ? -1 : 0}
        aria-label="Upload documents"
        onClick={() => !isAtLimit && fileInputRef.current?.click()}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") fileInputRef.current?.click(); }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed px-8 py-12 text-center transition-all cursor-pointer select-none ${
          isAtLimit
            ? "border-border bg-muted/20 cursor-not-allowed opacity-60"
            : isDragOver
            ? "border-toxic bg-toxic/5 shadow-[0_0_24px_rgba(57,255,20,0.1)]"
            : "border-border bg-card hover:border-toxic/50 hover:bg-toxic/5"
        }`}
      >
        <div className={`flex h-12 w-12 items-center justify-center rounded-xl border transition-colors ${isDragOver ? "border-toxic/40 bg-toxic/10 text-toxic" : "border-border bg-muted/40 text-muted-foreground"}`}>
          {isUploading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Upload className="h-5 w-5" />
          )}
        </div>

        <div>
          <p className="text-sm font-semibold text-foreground">
            {isDragOver ? "Drop to upload" : isAtLimit ? "Upload limit reached" : "Drag files here or click to browse"}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            PDF, Word, PowerPoint, TXT, or Markdown · Max 10 MB per file · Up to {MAX_FILE_COUNT} files
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          multiple
          className="sr-only"
          aria-hidden="true"
          onChange={handleFileInputChange}
        />
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      {/* In-flight uploads */}
      {uploading.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploading.map((u) => (
            <div key={u.id} className="flex items-center gap-3 rounded-xl border border-border/50 bg-card/50 px-4 py-3">
              <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted-foreground" />
              <p className="text-sm text-muted-foreground truncate">{u.name}</p>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded files */}
      {uploadedDocuments.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadedDocuments.map((doc) => (
            <DocumentChip
              key={doc.storagePath}
              doc={doc}
              isRemoving={removingPaths.has(doc.storagePath)}
              onRemove={() => handleRemove(doc)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
