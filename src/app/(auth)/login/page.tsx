"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Eye, EyeOff } from "lucide-react";

// Brand SVGs — lucide-react does not include Github/Chrome logos
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  );
}

import { signIn } from "@/lib/auth-client";

// ─── Components ───────────────────────────────────────────────────────────────

function OAuthButton({
  provider,
  icon: Icon,
  label,
  onClick,
  isLoading,
}: {
  provider: string;
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  isLoading?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-toxic/50 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </button>
  );
}

function FormField({
  id,
  label,
  type,
  value,
  onChange,
  placeholder,
  required,
  autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (val: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-toxic ml-0.5">*</span>}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-toxic focus:ring-1 focus:ring-toxic/50 focus:[box-shadow:0_0_0_3px_rgba(57,255,20,0.08)]"
      />
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("returnTo");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [serverError, setServerError] = useState<string>("");

  const canSubmit = email.trim() !== "" && password.length >= 8 && !isSubmitting;

  // ── OAuth handlers ─────────────────────────────────────────────────────────
  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    setServerError("");
    try {
      await signIn.social({ provider, callbackURL: returnTo || "/projects" });
    } catch {
      setServerError("OAuth sign-in failed. Please try again.");
      setOauthLoading(null);
    }
  }

  // ── Email / Password handlers ──────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const { error } = await signIn.email({
        email,
        password,
        callbackURL: returnTo || "/projects",
      });

      if (error) {
        setServerError(error.message || "Invalid email or password.");
        setIsSubmitting(false);
      } else {
        router.push("/projects");
      }
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
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
            Log in to Paceup
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Welcome back to your workspace.
          </p>

          {/* OAuth buttons */}
          <div className="space-y-2.5">
            <OAuthButton
              provider="Google"
              icon={GoogleIcon}
              label="Continue with Google"
              onClick={() => handleOAuth("google")}
              isLoading={oauthLoading === "google"}
            />
            <OAuthButton
              provider="GitHub"
              icon={GitHubIcon}
              label="Continue with GitHub"
              onClick={() => handleOAuth("github")}
              isLoading={oauthLoading === "github"}
            />
          </div>

          {/* Divider */}
          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          {/* Email/password form */}
          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <FormField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="alex@example.com"
              required
              autoComplete="email"
            />

            {/* Password */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="block text-sm font-medium text-foreground">
                  Password<span className="text-toxic ml-0.5">*</span>
                </label>
                <Link 
                  href="/forgot-password" 
                  className="text-xs text-muted-foreground hover:text-toxic transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="8+ characters"
                  required
                  autoComplete="current-password"
                  className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-toxic focus:ring-1 focus:ring-toxic/50 focus:[box-shadow:0_0_0_3px_rgba(57,255,20,0.08)] pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Server error */}
            {serverError && (
              <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
                {serverError}
              </p>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={!canSubmit}
              className="mt-2 w-full rounded-md bg-toxic px-4 py-2.5 text-sm font-semibold text-toxic-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Logging in...
                </span>
              ) : (
                "Log In"
              )}
            </button>
          </form>
        </div>

        {/* Sign up link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link
            href={returnTo ? `/signup?returnTo=${encodeURIComponent(returnTo)}` : "/signup"}
            className="font-medium text-foreground underline underline-offset-2 hover:text-toxic transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
