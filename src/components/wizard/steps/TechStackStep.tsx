"use client";

import { useState, useEffect, useRef } from "react";
import { X } from "lucide-react";
import type { WizardStepProps } from "@/types/wizard";

const COMMON_TECHNOLOGIES = [
  "React", "Next.js", "Node.js", "Python", "PostgreSQL", 
  "Flutter", "TypeScript", "Tailwind CSS", "MongoDB", "Express",
  "Django", "Spring Boot", "MySQL", "GraphQL", "Docker", "AWS",
];

export function TechStackStep({ step, formData, updateForm, setCanContinue }: WizardStepProps) {
  const [inputValue, setInputValue] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  // This step is always valid (non-blocking)
  useEffect(() => {
    setCanContinue(true);
  }, [setCanContinue]);

  const techStack = formData.techStack || [];

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !techStack.includes(trimmed)) {
      updateForm({ techStack: [...techStack, trimmed] });
    }
    setInputValue("");
    setSuggestions([]);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove: string) => {
    updateForm({ techStack: techStack.filter((tag) => tag !== tagToRemove) });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(inputValue);
    } else if (e.key === "Backspace" && !inputValue && techStack.length > 0) {
      removeTag(techStack[techStack.length - 1]);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim()) {
      const lowerVal = val.toLowerCase();
      const filtered = COMMON_TECHNOLOGIES.filter(
        (tech) => tech.toLowerCase().includes(lowerVal) && !techStack.includes(tech)
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const inputClasses =
    "w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-toxic/50 focus:border-toxic transition-all";

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

      <div className="space-y-4">
        {/* Chips display */}
        {techStack.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {techStack.map((tech) => (
              <div
                key={tech}
                className="flex items-center gap-1.5 rounded-full bg-toxic/10 border border-toxic/30 px-3 py-1.5 text-sm font-medium text-toxic"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTag(tech)}
                  className="rounded-full p-0.5 hover:bg-toxic/20 text-toxic hover:text-toxic transition-colors"
                  aria-label={`Remove ${tech}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input field */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type a technology and press Enter..."
            className={inputClasses}
          />

          {/* Autocomplete suggestions */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 rounded-xl border border-border bg-card shadow-lg overflow-hidden">
              <ul className="max-h-48 overflow-y-auto p-1">
                {suggestions.map((suggestion) => (
                  <li key={suggestion}>
                    <button
                      type="button"
                      className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted hover:text-toxic rounded-lg transition-colors cursor-pointer"
                      onClick={() => addTag(suggestion)}
                    >
                      {suggestion}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        
        <p className="text-xs text-muted-foreground mt-2">
          This helps the AI understand what your team will be building.
        </p>
        
        {/* Light nudge if empty */}
        {techStack.length === 0 && (
          <div className="mt-4 p-3 rounded-lg border border-yellow-500/20 bg-yellow-500/5 text-yellow-500/80 text-xs font-medium">
            Tip: We recommend adding at least one technology to get better AI task generation.
          </div>
        )}
      </div>
    </div>
  );
}
