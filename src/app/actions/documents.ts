"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase-server";
import type { UploadedDocument } from "@/types/wizard";

// ─── Constants ────────────────────────────────────────────────────────────────

const BUCKET = "project-docs";

// Accepted MIME types — PDFs and common document formats
const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
]);

// 10 MB hard limit — validate server-side, never trust client-reported size
const MAX_SIZE_BYTES = 10 * 1024 * 1024;

// ─── Upload action ────────────────────────────────────────────────────────────

/**
 * Upload a single document to Supabase Storage.
 * The file is stored at: temp/{userId}/{timestamp}_{sanitizedFilename}
 * This path is later moved to the real project folder when the project is created.
 */
export async function uploadDocumentAction(
  formData: FormData
): Promise<{ success: true; document: UploadedDocument } | { success: false; error: string }> {
  // Auth guard — derive user identity from the server session only
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { success: false, error: "No file provided." };
  }

  // ── Server-side validation ─────────────────────────────────────────────────
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return {
      success: false,
      error: "File type not supported. Upload PDFs, Word docs, or plain text files.",
    };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { success: false, error: "File is too large. Maximum size is 10 MB." };
  }

  // ── Build the storage path ─────────────────────────────────────────────────
  // Sanitise the filename — strip characters that could cause path traversal or encoding issues
  const sanitisedName = file.name
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .slice(0, 100);
  const storagePath = `temp/${userId}/${Date.now()}_${sanitisedName}`;

  // ── Upload to Supabase Storage ─────────────────────────────────────────────
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabaseAdmin.storage
    .from(BUCKET)
    .upload(storagePath, buffer, {
      contentType: file.type,
      upsert: false,
    });

  if (uploadError) {
    // Do not expose internal Supabase error messages to the client
    console.error("[uploadDocumentAction] Supabase upload error:", uploadError.message);
    return { success: false, error: "Upload failed. Please try again." };
  }

  // ── Get the public URL ─────────────────────────────────────────────────────
  const { data: urlData } = supabaseAdmin.storage
    .from(BUCKET)
    .getPublicUrl(storagePath);

  return {
    success: true,
    document: {
      storagePath,
      name: file.name,
      sizeBytes: file.size,
      url: urlData.publicUrl,
    },
  };
}

// ─── Delete action ────────────────────────────────────────────────────────────

/**
 * Remove a previously uploaded document from Supabase Storage.
 * Validates that the file belongs to the current user before deleting.
 */
export async function deleteDocumentAction(
  storagePath: string
): Promise<{ success: true } | { success: false; error: string }> {
  // Auth guard
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const userId = session.user.id;

  // Ownership check — the path must start with temp/{userId}/
  // Never trust a client-supplied path without verifying it belongs to the caller.
  if (!storagePath.startsWith(`temp/${userId}/`)) {
    return { success: false, error: "Permission denied." };
  }

  const { error: deleteError } = await supabaseAdmin.storage
    .from(BUCKET)
    .remove([storagePath]);

  if (deleteError) {
    console.error("[deleteDocumentAction] Supabase delete error:", deleteError.message);
    return { success: false, error: "Delete failed. Please try again." };
  }

  return { success: true };
}
