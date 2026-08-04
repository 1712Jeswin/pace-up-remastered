"use client";

import { useState } from "react";
import { X, Save } from "lucide-react";

interface EditTaskPanelProps {
  initialName: string;
  initialDescription: string | null;
  onSave: (name: string, description: string | null) => void;
  onCancel: () => void;
  isSaving: boolean;
}

export function EditTaskPanel({
  initialName,
  initialDescription,
  onSave,
  onCancel,
  isSaving,
}: EditTaskPanelProps) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave(name.trim(), description.trim() || null);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-xl border border-border/60 bg-muted/20 p-4 flex flex-col gap-3"
    >
      {/* Task name */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Task name
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={200}
          required
          autoFocus
          className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-toxic/30 transition"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1">
        <label className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-toxic/30 transition resize-none"
          placeholder="Optional description..."
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="h-3.5 w-3.5" />
          Cancel
        </button>
        <button
          type="submit"
          disabled={!name.trim() || isSaving}
          className="inline-flex items-center gap-1.5 rounded-lg bg-foreground px-3 py-1.5 text-xs font-semibold text-background transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          <Save className="h-3.5 w-3.5" />
          {isSaving ? "Saving..." : "Save"}
        </button>
      </div>
    </form>
  );
}
