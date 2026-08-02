"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { user } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { redis } from "@/lib/upstash";
import { nanoid } from "nanoid";
import type { StagedInvite } from "@/types/wizard";

// ─── Constants ────────────────────────────────────────────────────────────────

// Rate limit: max 10 handle lookups per user per minute
const LOOKUP_RATE_LIMIT = 10;
const LOOKUP_WINDOW_SECONDS = 60;

// Rate limit: max 5 invite stages per user per 10 minutes
const STAGE_RATE_LIMIT = 5;
const STAGE_WINDOW_SECONDS = 600;



/**
 * Resolves an exact handle to a user record.
 * No fuzzy or partial search — exact match only, to prevent user enumeration.
 * Rate-limited per caller to prevent systematic handle scraping.
 */
export async function lookupHandleAction(
  handle: string
): Promise<
  | { success: true; user: StagedInvite }
  | { success: false; error: string; notFound?: true }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }
  const callerId = session.user.id;

  // ── Rate limit ─────────────────────────────────────────────────────────────
  const rateLimitKey = `invite:lookup:${callerId}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    // Set TTL on first increment
    await redis.expire(rateLimitKey, LOOKUP_WINDOW_SECONDS);
  }
  if (count > LOOKUP_RATE_LIMIT) {
    return { success: false, error: "Too many lookups. Please wait a moment." };
  }

  // ── Input sanity ───────────────────────────────────────────────────────────
  const normalized = handle.toLowerCase().trim();
  if (!normalized || normalized.length < 3 || normalized.length > 24) {
    return { success: false, error: "Invalid handle format.", notFound: true };
  }

  // Cannot invite yourself
  const callerHandle = session.user as unknown as { handle?: string };
  if (
    typeof callerHandle.handle === "string" &&
    callerHandle.handle.toLowerCase() === normalized
  ) {
    return { success: false, error: "You cannot invite yourself." };
  }

  // ── Exact DB lookup ────────────────────────────────────────────────────────
  // Index used: user_handle_lower_idx (LOWER(handle))
  const results = await db
    .select({
      id: user.id,
      name: user.name,
      handle: user.handle,
      image: user.image,
    })
    .from(user)
    .where(eq(sql`LOWER(${user.handle})`, normalized))
    .limit(1);

  if (results.length === 0 || !results[0].handle) {
    return { success: false, error: "No user found with that handle.", notFound: true };
  }

  const found = results[0];
  // At this point found.handle is guaranteed non-null by the check above
  return {
    success: true,
    user: {
      userId: found.id,
      name: found.name,
      handle: found.handle!,
      image: found.image,
    },
  };
}

// ─── Generate invite link ─────────────────────────────────────────────────────

/**
 * Generates a shareable invite code and link for a project in-progress.
 * These are not yet persisted to the DB — they are stored in the wizard's
 * local state and committed when the project is created in the Review step.
 *
 * The code is a 6-character alphanumeric string.
 * The token is a 32-character URL-safe string.
 */
export async function generateInviteLinkAction(): Promise<
  | { success: true; code: string; inviteUrl: string }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  // Short human-readable code (e.g. "XJ9A2K")
  const code = nanoid(6).toUpperCase();
  // URL-safe token for the link
  const token = nanoid(32);

  // Construct the invite URL — the domain comes from the env, never from the client
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const inviteUrl = `${baseUrl}/join/${token}`;

  return { success: true, code, inviteUrl };
}

// ─── Rate-check for staging an invite ─────────────────────────────────────────

/**
 * Checks whether the current user can stage another invite.
 * Call this before adding a user to stagedInvites in the client.
 */
export async function checkInviteRateLimitAction(): Promise<
  { allowed: true } | { allowed: false; error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { allowed: false, error: "Not authenticated." };
  }
  const callerId = session.user.id;

  const rateLimitKey = `invite:stage:${callerId}`;
  const count = await redis.incr(rateLimitKey);
  if (count === 1) {
    await redis.expire(rateLimitKey, STAGE_WINDOW_SECONDS);
  }

  if (count > STAGE_RATE_LIMIT) {
    return {
      allowed: false,
      error: `Invite limit reached. You can send ${STAGE_RATE_LIMIT} invites every 10 minutes.`,
    };
  }

  return { allowed: true };
}
