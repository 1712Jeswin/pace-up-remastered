"use client";

import { useState, useEffect, KeyboardEvent } from "react";
import { Plus, X, GraduationCap, Code2, Users, Layout, BrainCircuit, Activity } from "lucide-react";
import type { JoinStepProps, SkillEntry, RolePreference } from "@/types/join";

const ROLES: { value: RolePreference; label: string; icon: React.ReactNode }[] = [
  { value: "Frontend", label: "Frontend", icon: <Layout className="h-4 w-4" /> },
  { value: "Backend", label: "Backend", icon: <Code2 className="h-4 w-4" /> },
  { value: "Design", label: "Design", icon: <BrainCircuit className="h-4 w-4" /> },
  { value: "Research", label: "Research", icon: <GraduationCap className="h-4 w-4" /> },
  { value: "PM-ish", label: "PM-ish", icon: <Users className="h-4 w-4" /> },
  { value: "Flexible", label: "Flexible", icon: <Activity className="h-4 w-4" /> },
];

export function SkillsSetupStep({ step, formData, updateForm, setCanContinue }: JoinStepProps) {
  const [newSkill, setNewSkill] = useState("");

  // Step 1 is required: must select a role. Skills and interests can be empty but role is required.
  useEffect(() => {
    setCanContinue(formData.rolePreference !== "");
  }, [formData.rolePreference, setCanContinue]);

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    const name = newSkill.trim();
    // avoid duplicates
    if (!formData.skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) {
      updateForm({
        skills: [...formData.skills, { name, confidence: "Comfortable" }],
      });
    }
    setNewSkill("");
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const removeSkill = (name: string) => {
    updateForm({
      skills: formData.skills.filter((s) => s.name !== name),
    });
  };

  const toggleConfidence = (name: string) => {
    updateForm({
      skills: formData.skills.map((s) =>
        s.name === name
          ? { ...s, confidence: s.confidence === "Comfortable" ? "Learning" : "Comfortable" }
          : s
      ),
    });
  };

  return (
    <div className="flex flex-col w-full animate-in fade-in duration-300">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">{step.heading}</h2>
        <p className="text-muted-foreground text-sm leading-relaxed">{step.description}</p>
        <p className="text-xs text-toxic/80 mt-2 font-medium">
          Note: This is specific to this project — your general profile stays separate.
        </p>
      </div>

      <div className="space-y-8">
        {/* ── Skills ────────────────────────────────────────────────────────── */}
        <div className="space-y-4">
          <label className="text-sm font-semibold text-foreground">Your Skillset for this Project</label>
          
          <div className="flex flex-wrap gap-2">
            {formData.skills.map((skill) => (
              <div
                key={skill.name}
                className="group flex items-center rounded-full border border-border bg-card overflow-hidden hover:border-toxic/40 transition-colors"
              >
                <span className="px-3 py-1.5 text-xs font-medium text-foreground">
                  {skill.name}
                </span>
                <button
                  type="button"
                  onClick={() => toggleConfidence(skill.name)}
                  className={`px-2 py-1.5 text-[10px] font-bold uppercase transition-colors ${
                    skill.confidence === "Comfortable"
                      ? "bg-toxic/20 text-toxic hover:bg-toxic/30"
                      : "bg-blue-500/20 text-blue-400 hover:bg-blue-500/30"
                  }`}
                  title="Toggle between Comfortable and Learning"
                >
                  {skill.confidence}
                </button>
                <button
                  type="button"
                  onClick={() => removeSkill(skill.name)}
                  className="px-2 py-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="relative">
            <input
              type="text"
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add a skill (e.g. Next.js, Figma, Python) and press Enter..."
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-toxic focus:outline-none focus:ring-2 focus:ring-toxic/50 transition-all"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-muted-foreground hover:bg-toxic/10 hover:text-toxic rounded-lg transition-colors"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* ── Role Preference ────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <label className="text-sm font-semibold text-foreground">Preferred Role</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {ROLES.map((role) => {
              const isSelected = formData.rolePreference === role.value;
              return (
                <button
                  key={role.value}
                  type="button"
                  onClick={() => updateForm({ rolePreference: role.value })}
                  className={`flex items-center gap-2 rounded-xl border p-3 transition-all ${
                    isSelected
                      ? "border-toxic bg-toxic/5 shadow-[0_0_12px_rgba(57,255,20,0.1)] text-toxic"
                      : "border-border bg-card text-muted-foreground hover:border-toxic/40 hover:text-foreground"
                  }`}
                >
                  {role.icon}
                  <span className="text-sm font-medium">{role.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Interests ──────────────────────────────────────────────────────── */}
        <div className="space-y-3">
          <label htmlFor="interests" className="text-sm font-semibold text-foreground">
            What aspects of this project interest you most? (Optional)
          </label>
          <textarea
            id="interests"
            value={formData.interests}
            onChange={(e) => updateForm({ interests: e.target.value })}
            placeholder="e.g. I want to learn more about AI integrations, or I'm excited about the design system..."
            className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-toxic focus:outline-none focus:ring-2 focus:ring-toxic/50 transition-all resize-none min-h-[100px]"
          />
        </div>
      </div>
    </div>
  );
}
