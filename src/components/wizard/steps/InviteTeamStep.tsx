"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Search,
  Link2,
  Copy,
  Check,
  X,
  Clock,
  Loader2,
  UserCheck,
  AlertCircle,
} from "lucide-react";
import {
  lookupHandleAction,
  generateInviteLinkAction,
  checkInviteRateLimitAction,
} from "@/app/actions/invites";
import type { WizardStepProps, StagedInvite } from "@/types/wizard";

// ─── Invite link panel ────────────────────────────────────────────────────────

interface InviteLinkPanelProps {
  code: string | null;
  inviteUrl: string | null;
  isGenerating: boolean;
  error: string | null;
  onGenerate: () => void;
}

function InviteLinkPanel({
  code,
  inviteUrl,
  isGenerating,
  error,
  onGenerate,
}: InviteLinkPanelProps) {
  const [copiedField, setCopiedField] = useState<"code" | "url" | null>(null);

  const copyToClipboard = async (text: string, field: "code" | "url") => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      // Clipboard API unavailable — silently skip
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-toxic" />
        <h3 className="text-sm font-semibold text-foreground">Invite by Link</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Share a link or short code that anyone can use to join this project.
      </p>

      {!code && !isGenerating && (
        <button
          id="generate-invite-link"
          type="button"
          onClick={onGenerate}
          className="rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-sm font-medium text-foreground hover:border-toxic/50 hover:bg-toxic/5 transition-all"
        >
          Generate link & code
        </button>
      )}

      {isGenerating && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Generating...
        </div>
      )}

      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      )}

      {code && inviteUrl && (
        <div className="space-y-3">
          {/* Short code */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Short Code
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
              <span className="flex-1 font-mono text-sm font-bold tracking-widest text-toxic">
                {code}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(code, "code")}
                aria-label="Copy invite code"
                className="flex h-7 w-7 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === "code" ? (
                  <Check className="h-3.5 w-3.5 text-toxic" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>

          {/* Full URL */}
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-widest text-muted-foreground">
              Invite Link
            </p>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2.5">
              <span className="flex-1 truncate text-xs text-muted-foreground">
                {inviteUrl}
              </span>
              <button
                type="button"
                onClick={() => copyToClipboard(inviteUrl, "url")}
                aria-label="Copy invite link"
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-foreground transition-colors"
              >
                {copiedField === "url" ? (
                  <Check className="h-3.5 w-3.5 text-toxic" />
                ) : (
                  <Copy className="h-3.5 w-3.5" />
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Handle search panel ──────────────────────────────────────────────────────

interface HandleSearchPanelProps {
  stagedInvites: StagedInvite[];
  onAdd: (invite: StagedInvite) => void;
}

function HandleSearchPanel({ stagedInvites, onAdd }: HandleSearchPanelProps) {
  const [input, setInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [resolved, setResolved] = useState<StagedInvite | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isAdding, setIsAdding] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isAlreadyStaged = resolved
    ? stagedInvites.some((i) => i.userId === resolved.userId)
    : false;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setInput(val);
    setResolved(null);
    setSearchError(null);

    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (val.length >= 3) {
      debounceRef.current = setTimeout(async () => {
        setIsSearching(true);
        const result = await lookupHandleAction(val);
        setIsSearching(false);

        if (result.success) {
          setResolved(result.user);
          setSearchError(null);
        } else if (!result.notFound) {
          // Only show errors that aren't "no user found" — notFound is handled by the UI state
          setSearchError(result.error);
        }
      }, 500);
    }
  };

  const handleAddInvite = useCallback(async () => {
    if (!resolved || isAlreadyStaged) return;
    setIsAdding(true);

    const rateLimitResult = await checkInviteRateLimitAction();
    if (!rateLimitResult.allowed) {
      setSearchError(rateLimitResult.error);
      setIsAdding(false);
      return;
    }

    onAdd(resolved);
    setInput("");
    setResolved(null);
    setIsAdding(false);
  }, [resolved, isAlreadyStaged, onAdd]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-toxic" />
        <h3 className="text-sm font-semibold text-foreground">Invite by Handle</h3>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed">
        Enter an exact Paceup handle to find a team member.
      </p>

      {/* Input */}
      <div className="relative">
        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground text-sm font-medium select-none">
          @
        </span>
        <input
          id="invite-handle-input"
          type="text"
          value={input}
          onChange={handleInputChange}
          placeholder="handle"
          maxLength={24}
          className="w-full rounded-xl border border-border bg-background pl-8 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-toxic/50 focus:border-toxic transition-all"
        />
        {isSearching && (
          <Loader2 className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {searchError && (
        <p className="flex items-center gap-1.5 text-xs text-destructive">
          <AlertCircle className="h-3.5 w-3.5 shrink-0" />
          {searchError}
        </p>
      )}

      {/* Resolved user card */}
      {resolved && (
        <div className="flex items-center gap-3 rounded-xl border border-toxic/20 bg-toxic/5 px-4 py-3">
          {/* Avatar */}
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground overflow-hidden">
            {resolved.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={resolved.image} alt={resolved.name} className="h-8 w-8 object-cover" />
            ) : (
              resolved.name.charAt(0).toUpperCase()
            )}
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{resolved.name}</p>
            <p className="text-xs text-muted-foreground">@{resolved.handle}</p>
          </div>

          {isAlreadyStaged ? (
            <div className="flex items-center gap-1 text-xs font-medium text-muted-foreground">
              <UserCheck className="h-3.5 w-3.5" />
              Added
            </div>
          ) : (
            <button
              id="confirm-invite-btn"
              type="button"
              onClick={handleAddInvite}
              disabled={isAdding}
              className="shrink-0 rounded-full bg-toxic px-4 py-1.5 text-xs font-bold text-toxic-foreground hover:bg-toxic/90 disabled:opacity-50 transition-all"
            >
              {isAdding ? <Loader2 className="h-3 w-3 animate-spin" /> : "Invite"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

export function InviteTeamStep({ step, formData, updateForm, setCanContinue }: WizardStepProps) {
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [linkError, setLinkError] = useState<string | null>(null);

  // This step is skippable — always allow continuing
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const stagedInvites = formData.stagedInvites ?? [];

  const handleGenerate = useCallback(async () => {
    setIsGenerating(true);
    setLinkError(null);
    const result = await generateInviteLinkAction();
    setIsGenerating(false);

    if (result.success) {
      setInviteCode(result.code);
      setInviteUrl(result.inviteUrl);
    } else {
      setLinkError(result.error);
    }
  }, []);

  const handleAddInvite = useCallback(
    (invite: StagedInvite) => {
      updateForm({ stagedInvites: [...stagedInvites, invite] });
    },
    [stagedInvites, updateForm]
  );

  const handleRemoveInvite = useCallback(
    (userId: string) => {
      updateForm({ stagedInvites: stagedInvites.filter((i) => i.userId !== userId) });
    },
    [stagedInvites, updateForm]
  );

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      {/* Two invite panels */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <HandleSearchPanel stagedInvites={stagedInvites} onAdd={handleAddInvite} />
        <InviteLinkPanel
          code={inviteCode}
          inviteUrl={inviteUrl}
          isGenerating={isGenerating}
          error={linkError}
          onGenerate={handleGenerate}
        />
      </div>

      {/* Pending invites list */}
      {stagedInvites.length > 0 && (
        <div className="mt-6">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
            Invites staged ({stagedInvites.length})
          </h4>
          <div className="space-y-2">
            {stagedInvites.map((invite) => (
              <div
                key={invite.userId}
                className="flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3"
              >
                {/* Avatar */}
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground overflow-hidden">
                  {invite.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={invite.image} alt={invite.name} className="h-7 w-7 object-cover" />
                  ) : (
                    invite.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{invite.name}</p>
                  <p className="text-xs text-muted-foreground">@{invite.handle}</p>
                </div>

                {/* Pending tag */}
                <div className="flex items-center gap-1.5 rounded-full bg-yellow-500/10 border border-yellow-500/20 px-2.5 py-1 text-[11px] font-semibold text-yellow-500">
                  <Clock className="h-3 w-3" />
                  Pending
                </div>

                {/* Remove */}
                <button
                  type="button"
                  onClick={() => handleRemoveInvite(invite.userId)}
                  aria-label={`Remove invite for ${invite.name}`}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer note */}
      <p className="mt-6 text-xs text-muted-foreground text-center">
        You can always invite more people later from <span className="font-semibold text-foreground">Team Settings</span>.
      </p>
    </div>
  );
}
