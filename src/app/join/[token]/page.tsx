"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Calendar, Users, Briefcase } from "lucide-react";
import { useSession } from "@/lib/auth-client";

type InviteData = {
  title: string;
  type: string;
  teamSize: number;
  deadline: string;
};

export default function JoinTokenPage({ params }: { params: Promise<{ token: string }> }) {
  const router = useRouter();
  const { token } = use(params);
  const { data: session, isPending: sessionLoading } = useSession();

  const [invite, setInvite] = useState<InviteData | null>(null);
  const [error, setError] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    async function resolveToken() {
      try {
        const res = await fetch(`/api/invites/resolve?token=${encodeURIComponent(token)}`);
        const data = await res.json();

        if (data.success && data.project) {
          setInvite(data.project);
        } else {
          setError(data.error || "Could not resolve invite.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    }

    resolveToken();
  }, [token]);

  const handleJoin = async () => {
    setJoining(true);
    // Phase 21: Route to the member profile setup flow instead of mocking a direct join.
    // The profile flow handles the actual project membership insertion.
    router.push(`/join/${encodeURIComponent(token)}/profile`);
  };

  const returnUrl = encodeURIComponent(`/join/${token}`);

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-[440px]">
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

        {/* Loading State */}
        {(loading || sessionLoading) && (
          <div className="rounded-xl border border-border bg-card px-8 py-12 shadow-sm flex flex-col items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-toxic mb-4" />
            <p className="text-sm text-muted-foreground">Resolving invite...</p>
          </div>
        )}

        {/* Error State */}
        {!loading && !sessionLoading && error && (
          <div className="rounded-xl border border-border bg-card px-8 py-8 shadow-sm">
            <div className="flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <h1 className="mb-2 text-xl font-heading font-semibold text-foreground">
                Invalid Invite
              </h1>
              <p className="mb-6 text-sm text-muted-foreground">
                {error}
              </p>
              <Link
                href="/join"
                className="w-full rounded-md bg-secondary px-4 py-2.5 text-sm font-semibold text-secondary-foreground transition-opacity hover:opacity-90 inline-block text-center"
              >
                Try another code
              </Link>
            </div>
          </div>
        )}

        {/* Success Preview State */}
        {!loading && !sessionLoading && !error && invite && (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {/* Preview Card Header */}
            <div className="bg-muted/50 p-6 border-b border-border">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-toxic">
                Project Invite
              </div>
              <h1 className="text-2xl font-heading font-bold text-foreground">
                {invite.title}
              </h1>
            </div>

            {/* Preview Card Body */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Briefcase className="h-4 w-4" />
                <span>{invite.type}</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{invite.teamSize} current members</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Deadline: {new Date(invite.deadline).toLocaleDateString()}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="p-6 pt-2 bg-card">
              {session ? (
                // Authenticated Actions
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground text-center">
                    Logged in as <span className="font-medium text-foreground">{session.user.name}</span>
                  </p>
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full rounded-md bg-toxic px-4 py-2.5 text-sm font-semibold text-toxic-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {joining ? (
                      <span className="flex items-center justify-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Joining...
                      </span>
                    ) : (
                      "Accept & Join"
                    )}
                  </button>
                </div>
              ) : (
                // Unauthenticated Actions
                <div className="space-y-3">
                  <Link
                    href={`/signup?returnTo=${returnUrl}`}
                    className="flex w-full items-center justify-center rounded-md bg-toxic px-4 py-2.5 text-sm font-semibold text-toxic-foreground transition-opacity hover:opacity-90"
                  >
                    Sign up to join
                  </Link>
                  <Link
                    href={`/login?returnTo=${returnUrl}`}
                    className="flex w-full items-center justify-center rounded-md border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted"
                  >
                    Log in to join
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
