"use client";

import { useEffect } from "react";
import { Clock, Briefcase, Globe } from "lucide-react";
import type { JoinStepProps } from "@/types/join";

// Common timezones for a basic selector
const TIMEZONES = [
  "UTC (Coordinated Universal Time)",
  "EST/EDT (New York)",
  "CST/CDT (Chicago)",
  "MST/MDT (Denver)",
  "PST/PDT (Los Angeles)",
  "GMT/BST (London)",
  "CET/CEST (Paris/Berlin)",
  "IST (India)",
  "SGT (Singapore)",
  "AEST/AEDT (Sydney)",
];

export function AvailabilityStep({ step, formData, updateForm, setCanContinue }: JoinStepProps) {
  // Step 2 is always valid, as defaults are provided (weeklyHours=10, otherProjects=false, timezone=UTC)
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
      </div>

      <div className="space-y-8">
        {/* ── Weekly Hours ──────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-toxic" />
              Weekly Commitment
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              How many hours per week can you realistically dedicate to this project?
            </p>
          </div>
          
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-muted-foreground">0h</span>
              <span className="text-2xl font-bold text-toxic">{formData.weeklyHours}h</span>
              <span className="text-sm font-medium text-muted-foreground">40h+</span>
            </div>
            
            <input
              type="range"
              min="0"
              max="40"
              step="5"
              value={formData.weeklyHours}
              onChange={(e) => updateForm({ weeklyHours: parseInt(e.target.value, 10) })}
              className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-toxic"
            />
          </div>
        </div>

        {/* ── Other Projects Toggle ─────────────────────────────────────────── */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-foreground flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-toxic" />
            Current Workload
          </label>
          
          <label className="flex items-center justify-between rounded-xl border border-border bg-card p-4 cursor-pointer hover:border-toxic/40 transition-colors">
            <div>
              <p className="text-sm font-medium text-foreground">Working on another project?</p>
              <p className="text-xs text-muted-foreground mt-0.5">Let the team know if you have other ongoing commitments.</p>
            </div>
            <div className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-toxic focus:ring-offset-2 focus:ring-offset-background" style={{ backgroundColor: formData.otherProjects ? 'rgb(57, 255, 20)' : 'rgb(39, 39, 42)' }}>
              <input
                type="checkbox"
                className="sr-only"
                checked={formData.otherProjects}
                onChange={(e) => updateForm({ otherProjects: e.target.checked })}
              />
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  formData.otherProjects ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </div>
          </label>
        </div>

        {/* ── Timezone ──────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="h-4 w-4 text-toxic" />
              Timezone
            </label>
            <p className="text-xs text-muted-foreground mt-1">
              Helps when scheduling syncs and assigning time-sensitive tasks.
            </p>
          </div>
          
          <div className="relative">
            <select
              value={formData.timezone}
              onChange={(e) => updateForm({ timezone: e.target.value })}
              className="w-full appearance-none rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground focus:border-toxic focus:outline-none focus:ring-2 focus:ring-toxic/50 transition-all cursor-pointer"
            >
              <option value="" disabled>Select your timezone</option>
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>
                  {tz}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-muted-foreground">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
