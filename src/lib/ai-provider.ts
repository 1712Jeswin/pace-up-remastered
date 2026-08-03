/**
 * AI Provider Factory
 *
 * Maps a provider name + decrypted API key to the correct Vercel AI SDK model handle.
 * All provider-specific SDK imports are centralised here — no provider code elsewhere.
 *
 * OpenRouter is routed through @ai-sdk/openai with a custom baseURL, since OpenRouter
 * exposes an OpenAI-compatible endpoint and there is no separate @ai-sdk/openrouter package.
 *
 * Groq is also routed through @ai-sdk/openai with its own baseURL for the same reason.
 */

import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { createAnthropic } from "@ai-sdk/anthropic";
import type { LanguageModel } from "ai";

// ─── Constants ────────────────────────────────────────────────────────────────

// Default model IDs per provider — chosen for the best cost/quality trade-off at
// the time of Phase 22. These can be made configurable in a future phase.
const DEFAULT_MODELS: Record<string, string> = {
  gemini: "gemini-2.0-flash",
  openai: "gpt-4o-mini",
  anthropic: "claude-3-5-haiku-latest",
  // Routed through the OpenAI-compatible endpoint
  openrouter: "openai/gpt-4o-mini",
  groq: "llama-3.1-70b-versatile",
};

// ─── Types ────────────────────────────────────────────────────────────────────

export type AiProviderName = "gemini" | "openai" | "anthropic" | "openrouter" | "groq";

// ─── Factory ──────────────────────────────────────────────────────────────────

/**
 * Returns a Vercel AI SDK `LanguageModelV1` handle ready to pass to `generateObject`.
 *
 * @param provider - The provider identifier stored in `project_api_key.provider`.
 * @param apiKey   - The decrypted plaintext API key. Never log this value.
 * @param modelId  - Optional override; defaults to the sensible default for the provider.
 *
 * @throws If `provider` is not a recognised value.
 */
export function getAiModel(
  provider: AiProviderName,
  apiKey: string,
  modelId?: string
): LanguageModel {
  const model = modelId ?? DEFAULT_MODELS[provider];

  if (!model) {
    throw new Error(`[ai-provider] No default model configured for provider "${provider}".`);
  }

  switch (provider) {
    case "gemini": {
      const google = createGoogleGenerativeAI({ apiKey });
      return google(model);
    }

    case "openai": {
      const openai = createOpenAI({ apiKey });
      return openai(model);
    }

    case "anthropic": {
      const anthropic = createAnthropic({ apiKey });
      return anthropic(model);
    }

    case "openrouter": {
      // OpenRouter exposes an OpenAI-compatible chat completions endpoint.
      // We pass the baseURL override and the caller's OpenRouter key as Bearer token.
      const openrouter = createOpenAI({
        apiKey,
        baseURL: "https://openrouter.ai/api/v1",
        headers: {
          // OpenRouter requires this header for usage tracking / rate limiting
          "HTTP-Referer": "https://paceup.dev",
          "X-Title": "Paceup",
        },
      });
      return openrouter(model);
    }

    case "groq": {
      // Groq exposes an OpenAI-compatible endpoint at api.groq.com
      const groq = createOpenAI({
        apiKey,
        baseURL: "https://api.groq.com/openai/v1",
      });
      return groq(model);
    }

    default: {
      // TypeScript exhaustiveness check — this should never be reached at runtime
      const _exhaustive: never = provider;
      throw new Error(`[ai-provider] Unknown provider: ${_exhaustive}`);
    }
  }
}
