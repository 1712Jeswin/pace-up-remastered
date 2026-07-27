"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, Loader2, Eye, EyeOff } from "lucide-react";

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
import { signIn, signUp } from "@/lib/auth-client";
import { motionPresets } from "@/lib/motion";

// ─── Constants ───────────────────────────────────────────────────────────────
const HANDLE_DEBOUNCE_MS = 450;
const HANDLE_REGEX = /^[a-z0-9_]{3,24}$/;

// ─── Utility ──────────────────────────────────────────────────────────────────
/**
 * Derives a candidate handle from a display name.
 * Lowercased, spaces stripped, special chars removed.
 */
function deriveHandle(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "")
    .slice(0, 24);
}

// ─── Types ────────────────────────────────────────────────────────────────────
type HandleStatus = "idle" | "checking" | "available" | "taken" | "invalid";

interface FormState {
  name: string;
  email: string;
  password: string;
  handle: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────
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
  isLoading: boolean;
}) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-3 rounded-md border border-border bg-secondary px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-secondary/80 hover:border-foreground/20 disabled:opacity-50 disabled:cursor-not-allowed"
      whileTap={{ scale: 0.98 }}
      transition={{ duration: motionPresets.durations.micro, ease: motionPresets.easing.easeOutCubic }}
      aria-label={`Continue with ${provider}`}
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      {label}
    </motion.button>
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
  suffix,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-toxic ml-0.5">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className="w-full rounded-md border border-border bg-input px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:border-toxic focus:ring-1 focus:ring-toxic/50 focus:[box-shadow:0_0_0_3px_rgba(57,255,20,0.08)] pr-10"
        />
        {suffix && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>
        )}
      </div>
    </div>
  );
}

function HandleStatusIcon({ status }: { status: HandleStatus }) {
  return (
    <AnimatePresence mode="wait">
      {status === "checking" && (
        <motion.span key="checking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </motion.span>
      )}
      {status === "available" && (
        <motion.span
          key="available"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionPresets.durations.micro, ease: motionPresets.easing.easeOutCubic }}
        >
          <Check className="h-4 w-4 text-toxic" />
        </motion.span>
      )}
      {(status === "taken" || status === "invalid") && (
        <motion.span
          key="taken"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionPresets.durations.micro, ease: motionPresets.easing.easeOutCubic }}
        >
          <X className="h-4 w-4 text-destructive" />
        </motion.span>
      )}
    </AnimatePresence>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function SignUpPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    password: "",
    handle: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [handleStatus, setHandleStatus] = useState<HandleStatus>("idle");
  const [handleHint, setHandleHint] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<"google" | "github" | null>(null);
  const [serverError, setServerError] = useState<string>("");

  // ── Auto-suggest handle from name ──────────────────────────────────────────
  useEffect(() => {
    if (form.name && !form.handle) {
      const suggested = deriveHandle(form.name);
      if (suggested.length >= 3) {
        setForm((f) => ({ ...f, handle: suggested }));
      }
    }
  }, [form.name]); // eslint-disable-line react-hooks/exhaustive-deps -- only run on name change, not handle

  // ── Debounced handle availability check ────────────────────────────────────
  const checkHandle = useCallback(async (handle: string) => {
    if (!handle) {
      setHandleStatus("idle");
      setHandleHint("");
      return;
    }
    if (!HANDLE_REGEX.test(handle)) {
      setHandleStatus("invalid");
      setHandleHint("3–24 chars: lowercase letters, numbers, underscores only.");
      return;
    }

    setHandleStatus("checking");
    setHandleHint("");

    try {
      const res = await fetch(`/api/handle/check?handle=${encodeURIComponent(handle)}`);
      const data = await res.json();

      if (data.available) {
        setHandleStatus("available");
        setHandleHint("Handle is available.");
      } else {
        setHandleStatus("taken");
        setHandleHint(data.reason ?? "Handle is already taken.");
      }
    } catch {
      setHandleStatus("idle");
      setHandleHint("Couldn't verify — try again.");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      checkHandle(form.handle);
    }, HANDLE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [form.handle, checkHandle]);

  // ── Form field updater ─────────────────────────────────────────────────────
  const setField = (field: keyof FormState) => (value: string) =>
    setForm((f) => ({ ...f, [field]: value }));

  // ── OAuth handlers ─────────────────────────────────────────────────────────
  async function handleOAuth(provider: "google" | "github") {
    setOauthLoading(provider);
    setServerError("");
    try {
      await signIn.social({ provider, callbackURL: "/projects" });
    } catch {
      setServerError("OAuth sign-in failed. Please try again.");
      setOauthLoading(null);
    }
  }

  // ── Email/password submit ──────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (handleStatus !== "available") return;

    setIsSubmitting(true);
    setServerError("");

    try {
      const result = await signUp.email({
        name: form.name,
        email: form.email,
        password: form.password,
        // TODO: Phase 4 — wire handle into Better Auth signup flow once the handle
        // column is added to the user schema and the handle system backend is built.
        callbackURL: "/projects",
      });

      if (result.error) {
        setServerError(result.error.message ?? "Sign up failed. Please try again.");
      } else {
        router.push("/projects");
      }
    } catch {
      setServerError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const canSubmit =
    form.name.trim().length > 0 &&
    form.email.trim().length > 0 &&
    form.password.length >= 8 &&
    handleStatus === "available" &&
    !isSubmitting;

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <motion.div
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          duration: motionPresets.durations.transition,
          ease: motionPresets.easing.easeOutCubic,
        }}
      >
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
            Create your account
          </h1>
          <p className="mb-6 text-sm text-muted-foreground">
            Join Paceup — free, forever.
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
            {/* Name */}
            <FormField
              id="name"
              label="Full name"
              type="text"
              value={form.name}
              onChange={setField("name")}
              placeholder="Alex Johnson"
              required
              autoComplete="name"
            />

            {/* Email */}
            <FormField
              id="email"
              label="Email"
              type="email"
              value={form.email}
              onChange={setField("email")}
              placeholder="alex@example.com"
              required
              autoComplete="email"
            />

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-sm font-medium text-foreground">
                Password<span className="text-toxic ml-0.5">*</span>
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={form.password}
                  onChange={(e) => setField("password")(e.target.value)}
                  placeholder="8+ characters"
                  required
                  autoComplete="new-password"
                  minLength={8}
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

            {/* Handle */}
            <div className="space-y-1.5">
              <label htmlFor="handle" className="block text-sm font-medium text-foreground">
                Your handle<span className="text-toxic ml-0.5">*</span>
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                  @
                </div>
                <input
                  id="handle"
                  name="handle"
                  type="text"
                  value={form.handle}
                  onChange={(e) => setField("handle")(e.target.value.toLowerCase())}
                  placeholder="yourhandle"
                  required
                  autoComplete="username"
                  maxLength={24}
                  className={`w-full rounded-md border bg-input pl-7 pr-10 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/60 outline-none transition-all focus:ring-1 focus:[box-shadow:0_0_0_3px_rgba(57,255,20,0.08)]
                    ${handleStatus === "available"
                      ? "border-toxic focus:border-toxic focus:ring-toxic/50"
                      : handleStatus === "taken" || handleStatus === "invalid"
                      ? "border-destructive/60 focus:border-destructive focus:ring-destructive/30"
                      : "border-border focus:border-toxic focus:ring-toxic/50"
                    }`}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <HandleStatusIcon status={handleStatus} />
                </div>
              </div>
              <AnimatePresence>
                {handleHint && (
                  <motion.p
                    key={handleHint}
                    className={`text-xs ${
                      handleStatus === "available" ? "text-toxic" : "text-muted-foreground"
                    }`}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: motionPresets.durations.micro }}
                  >
                    {handleHint}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>

            {/* Server error */}
            <AnimatePresence>
              {serverError && (
                <motion.p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: motionPresets.durations.micro }}
                >
                  {serverError}
                </motion.p>
              )}
            </AnimatePresence>

            {/* Terms */}
            <p className="text-xs text-muted-foreground leading-relaxed">
              By creating an account you agree to our{" "}
              <Link href="/security" className="underline hover:text-foreground transition-colors">
                Privacy &amp; Security Policy
              </Link>
              .
            </p>

            {/* Submit */}
            <motion.button
              id="signup-submit"
              type="submit"
              disabled={!canSubmit}
              className="w-full rounded-md bg-toxic px-4 py-2.5 text-sm font-semibold text-toxic-foreground transition-opacity hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
              whileTap={canSubmit ? { scale: 0.98 } : {}}
              transition={{ duration: motionPresets.durations.micro, ease: motionPresets.easing.easeOutCubic }}
            >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Creating account...
                </span>
              ) : (
                "Create Account"
              )}
            </motion.button>
          </form>
        </div>

        {/* Log in link */}
        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-foreground underline underline-offset-2 hover:text-toxic transition-colors"
          >
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
