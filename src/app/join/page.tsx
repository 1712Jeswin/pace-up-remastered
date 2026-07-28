"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function JoinManualPage() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = code.trim().length > 0 && !isSubmitting;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    // Simple redirect to the token resolution page
    router.push(`/join/${encodeURIComponent(code.trim())}`);
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[400px]">
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-foreground hover:text-toxic transition-colors"
          >
            <span className="text-2xl font-heading font-bold tracking-tight">
              pace<span className="text-toxic">up</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-xl border border-border bg-card px-8 py-8 shadow-sm">
          <h1 className="mb-1 text-xl font-heading font-semibold text-foreground">
            Join a Project
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Enter the invite code provided by your team.
          </p>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="code" className="block text-sm font-medium text-foreground">
                Invite Code
              </label>
              <input
                id="code"
                name="code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. valid-token-123"
                required
                autoComplete="off"
                className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-toxic focus:ring-1 focus:ring-toxic/50 focus:[box-shadow:0_0_0_3px_rgba(57,255,20,0.08)]"
              />
            </div>

            <button
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full rounded-md bg-toxic px-4 py-2.5 text-sm font-semibold text-toxic-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Resolving...
                </span>
              ) : (
                "Continue"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
