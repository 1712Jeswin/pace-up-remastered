"use server";

import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { encryptApiKey } from "@/lib/encryption";
import type { AiProvider, KeyPolicy } from "@/types/wizard";

// The empty string variant of AiProvider is only valid before a provider is selected;
// the action always receives a concrete provider value.
type ConcreteProvider = Exclude<AiProvider, "">;

// ─── Validate key format ──────────────────────────────────────────────────────

// Very basic format checks per provider — prevents accidental pastes of wrong content.
// NOT a functional key test (we don't make live API calls to validate).
const KEY_PATTERNS: Record<ConcreteProvider, RegExp> = {
  // Gemini keys traditionally start with AIza, but newer keys can start with AQ.
  gemini: /^(AIza|AQ\.)[0-9A-Za-z_-]{30,}$/,
  openai: /^sk-[A-Za-z0-9]{32,}$/,
  anthropic: /^sk-ant-[A-Za-z0-9_-]{80,}$/,
  openrouter: /^sk-or-[A-Za-z0-9_-]{32,}$/,
  groq: /^gsk_[A-Za-z0-9]{32,}$/,
};

// ─── Action ───────────────────────────────────────────────────────────────────

interface EncryptedKeyResult {
  /** The envelope-encrypted value safe to store in the DB. */
  encryptedKey: string;
  /** The provider the key belongs to. */
  provider: AiProvider;
  /** The policy selected for this project. */
  policy: KeyPolicy;
}

/**
 * Validates and envelope-encrypts an AI provider API key.
 * Returns the encrypted ciphertext — never the plaintext.
 * The plaintext key is never logged or stored.
 *
 * This action does NOT write to the DB — that happens in the Review step
 * when the project is created (Phase 19), so the key is only persisted
 * once the user confirms everything.
 */
export async function encryptApiKeyAction(params: {
  plaintext: string;
  provider: ConcreteProvider;
  policy: KeyPolicy;
}): Promise<
  | { success: true; result: EncryptedKeyResult }
  | { success: false; error: string }
> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated." };
  }

  const { plaintext, provider, policy } = params;

  // ── Server-side input validation ───────────────────────────────────────────
  if (!plaintext || plaintext.trim().length === 0) {
    return { success: false, error: "API key cannot be empty." };
  }

  const trimmed = plaintext.trim();

  // Key length sanity check
  if (trimmed.length < 16 || trimmed.length > 512) {
    return { success: false, error: "That doesn't look like a valid API key." };
  }

  // Format check per provider
  const pattern = KEY_PATTERNS[provider];
  if (pattern && !pattern.test(trimmed)) {
    return {
      success: false,
      error: `That doesn't look like a valid ${provider} API key. Check the format and try again.`,
    };
  }

  try {
    // Encrypt — plaintext key is used and then falls out of scope
    const encryptedKey = encryptApiKey(trimmed);

    return {
      success: true,
      result: { encryptedKey, provider, policy },
    };
  } catch (err) {
    // Surface config errors clearly (e.g. missing master key) without leaking details
    const message = err instanceof Error ? err.message : "Encryption failed.";
    console.error("[encryptApiKeyAction] Encryption error:", message);

    // If it's a key config issue, surface it; otherwise return generic message
    if (message.includes("ENCRYPTION_MASTER_KEY")) {
      return { success: false, error: "Server encryption is not configured. Contact support." };
    }
    return { success: false, error: "Failed to secure the key. Please try again." };
  }
}
