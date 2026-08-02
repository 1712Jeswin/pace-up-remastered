"use client";

import { useState, useEffect, useCallback } from "react";
import { Eye, EyeOff, ExternalLink, CheckCircle2, Loader2, AlertCircle, Shield } from "lucide-react";
import { encryptApiKeyAction } from "@/app/actions/api-key";
import type { WizardStepProps, AiProvider, KeyPolicy, ProviderKeyState } from "@/types/wizard";

// ─── Provider config ──────────────────────────────────────────────────────────

interface ProviderConfig {
  id: AiProvider;
  name: string;
  tagline: string;
  freeTierNote: string;
  keyGuideUrl: string;
  placeholder: string;
  isSuggested?: boolean;
}

const PROVIDERS: ProviderConfig[] = [
  {
    id: "gemini",
    name: "Google Gemini",
    tagline: "Google's latest multimodal model",
    freeTierNote: "Generous free tier — 1.5M tokens/day on Flash",
    keyGuideUrl: "https://aistudio.google.com/app/apikey",
    placeholder: "AIzaSy...",
    isSuggested: true,
  },
  {
    id: "groq",
    name: "Groq",
    tagline: "Extremely fast inference",
    freeTierNote: "Free tier available — fast Llama & Mixtral models",
    keyGuideUrl: "https://console.groq.com/keys",
    placeholder: "gsk_...",
  },
  {
    id: "openrouter",
    name: "OpenRouter",
    tagline: "Access 100+ models via one API",
    freeTierNote: "Free credits on signup, pay-as-you-go after",
    keyGuideUrl: "https://openrouter.ai/keys",
    placeholder: "sk-or-...",
  },
  {
    id: "openai",
    name: "OpenAI",
    tagline: "GPT-4o and o1 models",
    freeTierNote: "No free tier — requires billing setup",
    keyGuideUrl: "https://platform.openai.com/api-keys",
    placeholder: "sk-...",
  },
  {
    id: "anthropic",
    name: "Anthropic",
    tagline: "Claude Sonnet & Haiku",
    freeTierNote: "No free tier — requires billing setup",
    keyGuideUrl: "https://console.anthropic.com/settings/keys",
    placeholder: "sk-ant-...",
  },
];

// ─── Provider card ────────────────────────────────────────────────────────────

interface ProviderCardProps {
  config: ProviderConfig;
  isSelected: boolean;
  onSelect: () => void;
}

function ProviderCard({ config, isSelected, onSelect }: ProviderCardProps) {
  return (
    <button
      type="button"
      id={`provider-${config.id}`}
      onClick={onSelect}
      className={`relative w-full text-left rounded-2xl border p-4 transition-all focus:outline-none focus:ring-2 focus:ring-toxic/50 ${
        isSelected
          ? "border-toxic bg-toxic/5 shadow-[0_0_16px_rgba(57,255,20,0.1)]"
          : "border-border bg-card hover:border-toxic/40 hover:bg-toxic/5"
      }`}
    >
      {config.isSuggested && (
        <span className="absolute top-3 right-3 rounded-full bg-toxic/20 px-2 py-0.5 text-[10px] font-bold text-toxic">
          Suggested
        </span>
      )}
      <p className="text-sm font-bold text-foreground pr-16">{config.name}</p>
      <p className="mt-0.5 text-xs text-muted-foreground">{config.tagline}</p>
      <p className="mt-2 text-[11px] font-medium text-toxic/80">{config.freeTierNote}</p>
    </button>
  );
}

// ─── Key input section ────────────────────────────────────────────────────────

interface KeyInputSectionProps {
  provider: ProviderConfig;
  isSaved: boolean;
  isEncrypting: boolean;
  error: string | null;
  onSave: (plaintext: string) => void;
  onClear: () => void;
}

function KeyInputSection({ provider, isSaved, isEncrypting, error, onSave, onClear }: KeyInputSectionProps) {
  const [value, setValue] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const handleSave = () => {
    if (value.trim()) onSave(value.trim());
  };

  if (isSaved) {
    return (
      <div className="flex items-center justify-between rounded-xl border border-toxic/30 bg-toxic/5 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <CheckCircle2 className="h-4 w-4 text-toxic shrink-0" />
          <div>
            <p className="text-sm font-semibold text-foreground">Key saved</p>
            <p className="text-xs text-muted-foreground">Your key is encrypted and will never be shown again.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onClear}
          className="text-xs text-muted-foreground hover:text-foreground transition-colors ml-4 shrink-0"
        >
          Replace key
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <input
          id="api-key-input"
          type={isVisible ? "text" : "password"}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={provider.placeholder}
          autoComplete="off"
          spellCheck={false}
          className="w-full rounded-xl border border-border bg-card px-4 py-3 pr-12 font-mono text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-toxic/50 focus:border-toxic transition-all"
        />
        <button
          type="button"
          onClick={() => setIsVisible((v) => !v)}
          aria-label={isVisible ? "Hide API key" : "Show API key"}
          className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          {isVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>

      {error && (
        <div className="flex items-start gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
          {error}
        </div>
      )}

      <div className="flex items-center justify-between gap-4">
        <a
          href={provider.keyGuideUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ExternalLink className="h-3 w-3" />
          How do I get a key?
        </a>

        <button
          id="save-api-key-btn"
          type="button"
          onClick={handleSave}
          disabled={!value.trim() || isEncrypting}
          className="flex items-center gap-2 rounded-full bg-toxic px-5 py-2 text-xs font-bold text-toxic-foreground hover:bg-toxic/90 disabled:opacity-40 disabled:pointer-events-none transition-all"
        >
          {isEncrypting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Shield className="h-3 w-3" />}
          {isEncrypting ? "Encrypting..." : "Save & Encrypt"}
        </button>
      </div>
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export function AiProviderStep({ step, formData, updateForm, setCanContinue }: WizardStepProps) {
  const [selectedProvider, setSelectedProvider] = useState<AiProvider>("gemini");
  const [policy, setPolicy] = useState<KeyPolicy>("owner_key");
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptError, setEncryptError] = useState<string | null>(null);

  const providerKey = formData.providerKey;
  const isSaved = providerKey?.isSaved === true;

  // Step is skippable — always allow continuing, but show a soft warning if no key saved
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const selectedConfig = PROVIDERS.find((p) => p.id === selectedProvider) ?? PROVIDERS[0];

  const handleSelectProvider = (id: AiProvider) => {
    setSelectedProvider(id);
    setEncryptError(null);
    // Clear the saved key state when switching providers
    if (providerKey?.provider !== id) {
      updateForm({ providerKey: null });
    }
  };

  const handleSaveKey = useCallback(
    async (plaintext: string) => {
      setIsEncrypting(true);
      setEncryptError(null);

      const result = await encryptApiKeyAction({
        plaintext,
        provider: selectedProvider as Exclude<AiProvider, "">,
        policy,
      });

      setIsEncrypting(false);

      if (result.success) {
        const keyState: ProviderKeyState = {
          provider: result.result.provider,
          encryptedKey: result.result.encryptedKey,
          policy: result.result.policy,
          isSaved: true,
        };
        updateForm({ providerKey: keyState });
      } else {
        setEncryptError(result.error);
      }
    },
    [selectedProvider, policy, updateForm]
  );

  const handleClearKey = () => {
    updateForm({ providerKey: null });
    setEncryptError(null);
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      {/* Provider cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-6">
        {PROVIDERS.map((p) => (
          <ProviderCard
            key={p.id}
            config={p}
            isSelected={selectedProvider === p.id}
            onSelect={() => handleSelectProvider(p.id)}
          />
        ))}
      </div>

      {/* Key input */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-4 mb-6">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-toxic" />
          <h3 className="text-sm font-semibold text-foreground">
            {selectedConfig.name} API Key
          </h3>
        </div>
        <KeyInputSection
          provider={selectedConfig}
          isSaved={isSaved}
          isEncrypting={isEncrypting}
          error={encryptError}
          onSave={handleSaveKey}
          onClear={handleClearKey}
        />
      </div>

      {/* Policy toggle */}
      <div className="rounded-2xl border border-border bg-card p-5 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Key Policy</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Choose how AI API costs are handled for this project.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {(
            [
              {
                value: "owner_key" as KeyPolicy,
                label: "Only I use my key",
                description: "All AI calls use your key. Your team doesn't need to connect one.",
              },
              {
                value: "per_member_key" as KeyPolicy,
                label: "Each member uses their own key",
                description: "Every member must connect their own provider key to use AI features.",
              },
            ] as const
          ).map(({ value, label, description }) => (
            <button
              key={value}
              id={`policy-${value}`}
              type="button"
              onClick={() => setPolicy(value)}
              className={`text-left rounded-xl border p-4 transition-all ${
                policy === value
                  ? "border-toxic bg-toxic/5"
                  : "border-border hover:border-toxic/40 hover:bg-muted/30"
              }`}
            >
              <p className="text-sm font-semibold text-foreground">{label}</p>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Soft skip warning */}
      {!isSaved && (
        <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-xs text-yellow-500/90 leading-relaxed">
            <span className="font-semibold">You can connect a provider later</span>, but AI features
            won't work until you do.
          </p>
        </div>
      )}
    </div>
  );
}
