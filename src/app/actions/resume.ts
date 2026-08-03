"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = "member-resumes";

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);

// 10 MB hard limit — validated server-side, never trust client-reported size
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// ─── Types ────────────────────────────────────────────────────────────────────

export type UploadResumeResult =
  | { success: true; storagePath: string; url: string; fileName: string; sizeBytes: number }
  | { success: false; error: string };

export type ParseResumeResult =
  | { success: true; summary: string }
  | { success: false; error: string };

export type DeleteResumeResult =
  | { success: true }
  | { success: false; error: string };

// ─── Upload ───────────────────────────────────────────────────────────────────

/**
 * Uploads a resume file to the `member-resumes` Supabase Storage bucket.
 * Path: resumes/{projectId}/{userId}/{timestamp}_{sanitizedFilename}
 *
 * @param formData - Must contain a `file` field and a `projectId` field.
 */
export async function uploadResumeAction(
  formData: FormData
): Promise<UploadResumeResult> {
  // Auth guard — derive user identity from session only
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  const file = formData.get("file");
  const projectId = formData.get("projectId");

  if (!(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }
  if (typeof projectId !== "string" || !projectId.trim()) {
    return { success: false, error: "Project ID is required." };
  }

  // ── Server-side validation ─────────────────────────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: "File type not supported. Upload a PDF, Word doc, or plain text file.",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "File is too large. Maximum size is 10 MB." };
  }

  // ── Build storage path ─────────────────────────────────────────────────────
  // Sanitise the filename to prevent path traversal or encoding issues
  const sanitisedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
  const storagePath = `resumes/${projectId}/${userId}/${Date.now()}_${sanitisedName}`;

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    console.error("[uploadResumeAction] Supabase upload error:", uploadError.message);
    return { success: false, error: "Upload failed. Please try again." };
  }

  // ── Get the public URL ─────────────────────────────────────────────────────
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    success: true,
    storagePath,
    url: urlData.publicUrl,
    fileName: file.name,
    sizeBytes: file.size,
  };
}

// ─── Parse (AI extraction) ────────────────────────────────────────────────────

/**
 * Parses a resume to extract a short, relevant experience summary.
 *
 * TODO: [Phase 22] Wire in the Vercel AI SDK once the multi-provider routing
 * is built. The flow will be:
 *   1. Download the file from `member-resumes` bucket using `storagePath`.
 *   2. Extract text (PDF → text via a server-side parser, DOCX → text via docx parser).
 *   3. Call the project owner's configured AI provider via the Vercel AI SDK:
 *      `generateText({ model, prompt: RESUME_PARSE_PROMPT + extractedText })`
 *   4. Return the generated summary.
 *
 * For now, returns a placeholder summary so the UI flow can be validated end-to-end.
 */
export async function parseResumeAction(
  storagePath: string,
  projectId: string
): Promise<ParseResumeResult> {
  // Auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  // Ownership check — path must begin with resumes/{projectId}/{userId}/
  const expectedPrefix = `resumes/${projectId}/${userId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return { success: false, error: "Permission denied." };
  }

  // TODO: [Phase 22] Replace this stub with real AI extraction logic.
  // The placeholder simulates a short async delay so the AiThinking UI can
  // be visually validated without a real AI provider configured.
  await new Promise<void>((resolve) => setTimeout(resolve, 2000));

  return {
    success: true,
    summary:
      "Experienced in collaborative software projects, with background in " +
      "full-stack development and a track record of delivering features under " +
      "deadline. Comfortable working across frontend and backend, and familiar " +
      "with agile team workflows. — (Edit this to reflect your actual experience.)",
  };
}

// ─── Delete ───────────────────────────────────────────────────────────────────

/**
 * Removes a previously uploaded resume from Supabase Storage.
 * Validates ownership before deleting — path must belong to the calling user.
 */
export async function deleteResumeAction(
  storagePath: string,
  projectId: string
): Promise<DeleteResumeResult> {
  // Auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  // Ownership check — path must begin with resumes/{projectId}/{userId}/
  const expectedPrefix = `resumes/${projectId}/${userId}/`;
  if (!storagePath.startsWith(expectedPrefix)) {
    return { success: false, error: "Permission denied." };
  }

  const { error: deleteError } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (deleteError) {
    console.error("[deleteResumeAction] Supabase delete error:", deleteError.message);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}
