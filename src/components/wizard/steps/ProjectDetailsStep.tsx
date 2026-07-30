"use client";

import { useEffect } from "react";
import type { WizardStepProps, ProjectType } from "@/types/wizard";

const PROJECT_TYPES: ProjectType[] = [
  "Hackathon",
  "Final-Year Project",
  "Coursework",
  "Club Project",
  "Research",
];

export function ProjectDetailsStep({ step, formData, updateForm, setCanContinue }: WizardStepProps) {
  // Validation: Title, Type, and Deadline are required
  useEffect(() => {
    const isValid =
      formData.title.trim().length > 0 &&
      formData.type !== "" &&
      formData.deadline.trim().length > 0;
    
    setCanContinue(isValid);
  }, [formData.title, formData.type, formData.deadline, setCanContinue]);

  const inputClasses =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-toxic/50 focus:border-toxic transition-all";
  
  const labelClasses = "block text-sm font-semibold text-foreground mb-1.5";
  const helperClasses = "text-xs text-muted-foreground mt-1";

  return (
    <div className="flex flex-col w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="mb-8">
        <h2 className="font-heading text-2xl font-bold text-foreground mb-2">
          {step.heading}
        </h2>
        <p className="text-muted-foreground text-sm leading-relaxed">
          {step.description}
        </p>
      </div>

      <div className="space-y-6">
        {/* Title */}
        <div>
          <label htmlFor="title" className={labelClasses}>
            Project Title <span className="text-toxic">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={formData.title}
            onChange={(e) => updateForm({ title: e.target.value })}
            placeholder="e.g. Paceup AI Task Manager"
            className={inputClasses}
            required
          />
        </div>

        {/* Project Type & Deadline (Row) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="type" className={labelClasses}>
              Project Type <span className="text-toxic">*</span>
            </label>
            <select
              id="type"
              value={formData.type}
              onChange={(e) => updateForm({ type: e.target.value as ProjectType })}
              className={`${inputClasses} appearance-none cursor-pointer`}
              required
            >
              <option value="" disabled>Select a type...</option>
              {PROJECT_TYPES.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="deadline" className={labelClasses}>
              Deadline <span className="text-toxic">*</span>
            </label>
            <input
              id="deadline"
              type="date"
              value={formData.deadline}
              onChange={(e) => updateForm({ deadline: e.target.value })}
              className={inputClasses}
              required
            />
          </div>
        </div>

        {/* Problem Statement */}
        <div>
          <label htmlFor="problemStatement" className={labelClasses}>
            Problem Statement
          </label>
          <textarea
            id="problemStatement"
            value={formData.problemStatement}
            onChange={(e) => updateForm({ problemStatement: e.target.value })}
            placeholder="e.g. Students struggle to break down complex projects into actionable, trackable tasks."
            className={`${inputClasses} min-h-[100px] resize-y`}
          />
          <p className={helperClasses}>Optional, but helps AI understand the context.</p>
        </div>

        {/* Proposed Solution */}
        <div>
          <label htmlFor="solution" className={labelClasses}>
            Proposed Solution
          </label>
          <textarea
            id="solution"
            value={formData.solution}
            onChange={(e) => updateForm({ solution: e.target.value })}
            placeholder="e.g. An AI-powered workspace that automatically generates task breakdowns based on a project brief."
            className={`${inputClasses} min-h-[100px] resize-y`}
          />
          <p className={helperClasses}>Optional. How are you solving the problem?</p>
        </div>

        {/* Scope */}
        <div>
          <label htmlFor="scope" className={labelClasses}>
            Project Scope
          </label>
          <textarea
            id="scope"
            value={formData.scope}
            onChange={(e) => updateForm({ scope: e.target.value })}
            placeholder="e.g. MVP includes auth, project creation wizard, and AI task generation. Out of scope: billing, mobile app."
            className={`${inputClasses} min-h-[100px] resize-y`}
          />
          <p className={helperClasses}>Optional. What's in and what's out?</p>
        </div>
      </div>
    </div>
  );
}
