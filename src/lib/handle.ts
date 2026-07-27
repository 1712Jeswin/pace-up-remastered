import { db } from "./db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

// ─── Constants ────────────────────────────────────────────────────────────────

/** Only lowercase letters, digits, and underscores. 3–24 characters. */
export const HANDLE_REGEX = /^[a-z0-9_]{3,24}$/;

/**
 * Handles that cannot be claimed regardless of availability in the DB.
 * Prevents confusion with system routes and known terms.
 */
const RESERVED_HANDLES = new Set([
  "admin",
  "api",
  "app",
  "auth",
  "dashboard",
  "dev",
  "help",
  "login",
  "logout",
  "paceup",
  "pricing",
  "projects",
  "security",
  "settings",
  "signup",
  "status",
  "support",
  "team",
  "user",
]);

// ─── Validation ───────────────────────────────────────────────────────────────

interface HandleValidation {
  isValid: boolean;
  reason?: string;
}

/** Validates format and reserved-word rules. Does NOT check DB uniqueness. */
export function validateHandle(handle: string): HandleValidation {
  if (!handle) {
    return { isValid: false, reason: "Handle is required." };
  }

  if (handle.length < 3) {
    return { isValid: false, reason: "Handle must be at least 3 characters." };
  }

  if (handle.length > 24) {
    return { isValid: false, reason: "Handle must be 24 characters or fewer." };
  }

  if (!HANDLE_REGEX.test(handle)) {
    return {
      isValid: false,
      reason: "Handle may only contain lowercase letters, numbers, and underscores.",
    };
  }

  if (RESERVED_HANDLES.has(handle)) {
    return { isValid: false, reason: "This handle is reserved." };
  }

  return { isValid: true };
}

// ─── DB Queries ───────────────────────────────────────────────────────────────

/**
 * Checks whether a handle is available (case-insensitive).
 * Returns `true` if no user has this handle.
 */
export async function isHandleAvailable(handle: string): Promise<boolean> {
  const normalized = handle.toLowerCase().trim();

  const result = await db
    .select({ id: user.id })
    .from(user)
    .where(eq(sql`LOWER(${user.handle})`, normalized))
    .limit(1);

  return result.length === 0;
}

/**
 * Full availability check: validates format, checks reserved list, then DB.
 */
export async function checkHandleAvailability(
  handle: string
): Promise<{ available: boolean; reason?: string }> {
  const normalized = handle.toLowerCase().trim();
  const validation = validateHandle(normalized);

  if (!validation.isValid) {
    return { available: false, reason: validation.reason };
  }

  const available = await isHandleAvailable(normalized);
  if (!available) {
    return { available: false, reason: "This handle is already taken." };
  }

  return { available: true };
}

// ─── Handle Generation ────────────────────────────────────────────────────────

/**
 * Normalizes a raw string into a valid handle candidate.
 * Lowercases, replaces spaces/hyphens with underscores, strips invalid chars.
 */
function normalizeToHandle(raw: string): string {
  return raw
    .toLowerCase()
    .trim()
    .replace(/[\s-]+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .replace(/^_+|_+$/g, "")     // strip leading/trailing underscores
    .replace(/_{2,}/g, "_")       // collapse consecutive underscores
    .slice(0, 24);
}

/**
 * Generates a candidate handle from a display name.
 * If the base candidate is taken, appends incrementing numeric suffixes.
 * Returns the first available handle.
 */
export async function suggestHandleFromName(name: string): Promise<string> {
  const base = normalizeToHandle(name);
  if (base.length < 3) {
    // Name was too short after normalization — fall back to a generic prefix
    return suggestWithSuffix("user");
  }

  const validation = validateHandle(base);
  if (validation.isValid && (await isHandleAvailable(base))) {
    return base;
  }

  return suggestWithSuffix(base);
}

/**
 * Generates a candidate handle from a GitHub username.
 * Prefers using the GitHub username directly if it passes validation.
 */
export async function suggestHandleFromGitHub(
  githubUsername: string
): Promise<string> {
  const normalized = normalizeToHandle(githubUsername);
  if (normalized.length < 3) {
    return suggestWithSuffix("user");
  }

  const validation = validateHandle(normalized);
  if (validation.isValid && (await isHandleAvailable(normalized))) {
    return normalized;
  }

  return suggestWithSuffix(normalized);
}

/**
 * Internal helper: appends 1, 2, 3... to a base until an available handle is found.
 * Caps at 50 attempts to avoid unbounded loops.
 */
async function suggestWithSuffix(base: string): Promise<string> {
  const MAX_SUFFIX_ATTEMPTS = 50;
  const truncatedBase = base.slice(0, 20); // leave room for suffix digits

  for (let i = 1; i <= MAX_SUFFIX_ATTEMPTS; i++) {
    const candidate = `${truncatedBase}${i}`;
    const validation = validateHandle(candidate);
    if (validation.isValid && (await isHandleAvailable(candidate))) {
      return candidate;
    }
  }

  // Extremely unlikely fallback — should never happen in practice
  return `${truncatedBase}_${Date.now().toString(36).slice(-4)}`;
}

/**
 * Sets the handle on an existing user record.
 * Called after signup to claim the handle.
 */
export async function setUserHandle(
  userId: string,
  handle: string
): Promise<void> {
  const normalized = handle.toLowerCase().trim();

  await db
    .update(user)
    .set({ handle: normalized })
    .where(eq(user.id, userId));
}
