"use client";

import { useState, useTransition } from "react";
import { Pencil } from "lucide-react";
import { updateTaskAction } from "@/app/actions/breakdown";
import { ReassignDropdown } from "./ReassignDropdown";
import { EditTaskPanel } from "./EditTaskPanel";
import { HumanOverrideBadge } from "./HumanOverrideBadge";
import { AiRationaleCallout } from "@/components/ai/AiRationaleCallout";
import { AiUncertainty } from "@/components/ai/AiUncertainty";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Member {
  userId: string;
  name: string;
  image: string | null;
}

interface TaskCardProps {
  id: string;
  projectId: string;
  initialName: string;
  initialDescription: string | null;
  effortHours: number | null;
  initialAssigneeId: string | null;
  initialAssignee: { name: string; image: string | null } | null;
  aiRationale: string | null;
  initialLowConfidence: boolean;
  lowConfidenceNote: string | null;
  initialHumanOverride: boolean;
  allMembers: Member[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TaskCard({
  id,
  projectId,
  initialName,
  initialDescription,
  effortHours,
  initialAssigneeId,
  initialAssignee,
  aiRationale,
  initialLowConfidence,
  lowConfidenceNote,
  initialHumanOverride,
  allMembers,
}: TaskCardProps) {
  // ── Local state — optimistic edits ─────────────────────────────────────────
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [assigneeId, setAssigneeId] = useState(initialAssigneeId);
  const [assignee, setAssignee] = useState(initialAssignee);
  const [isHumanOverride, setIsHumanOverride] = useState(initialHumanOverride);
  const [lowConfidence, setLowConfidence] = useState(initialLowConfidence);

  const [isEditing, setIsEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSaving, startSaving] = useTransition();

  // ── Reassign handler ────────────────────────────────────────────────────────
  function handleReassign(userId: string | null, member: Member | null) {
    // Optimistic update
    setAssigneeId(userId);
    setAssignee(member ? { name: member.name, image: member.image } : null);
    setIsHumanOverride(true);
    setLowConfidence(false); // Human reassignment resolves low confidence

    startSaving(async () => {
      const result = await updateTaskAction({
        projectId,
        taskId: id,
        assigneeUserId: userId,
      });
      if (!result.success) {
        // Roll back on error
        setAssigneeId(initialAssigneeId);
        setAssignee(initialAssignee);
        setIsHumanOverride(initialHumanOverride);
        setSaveError(result.error);
      }
    });
  }

  // ── Edit save handler ───────────────────────────────────────────────────────
  function handleSaveEdit(newName: string, newDescription: string | null) {
    // Optimistic update
    setName(newName);
    setDescription(newDescription);
    setIsHumanOverride(true);
    setIsEditing(false);

    startSaving(async () => {
      const result = await updateTaskAction({
        projectId,
        taskId: id,
        name: newName,
        description: newDescription ?? undefined,
      });
      if (!result.success) {
        // Roll back on error
        setName(initialName);
        setDescription(initialDescription);
        setIsHumanOverride(initialHumanOverride);
        setSaveError(result.error);
      }
    });
  }

  return (
    <div className="flex flex-col gap-2">
      {/* Card */}
      <div
        className={`group rounded-xl border bg-card p-4 flex flex-col gap-3 transition-colors ${
          lowConfidence ? "border-dashed border-muted-foreground/40" : "border-border/50"
        }`}
      >
        {/* Low-confidence wrapper header */}
        {lowConfidence && (
          <div className="flex items-center gap-1.5 -mt-1 mb-0.5">
            <span className="text-[10px] font-mono text-muted-foreground/60">
              ⚠ {lowConfidenceNote ?? "Low confidence — review this assignment"}
            </span>
          </div>
        )}

        {/* Task header */}
        <div className="flex items-start justify-between gap-3">
          <h4 className="text-sm font-semibold text-foreground leading-snug">{name}</h4>
          <div className="flex items-center gap-1.5 shrink-0">
            {effortHours !== null && (
              <span className="rounded-md border border-border/60 bg-muted/40 px-2 py-0.5 text-xs font-mono text-muted-foreground whitespace-nowrap">
                ~{effortHours}h
              </span>
            )}
            {/* Edit button — visible on hover */}
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="opacity-0 group-hover:opacity-100 transition-opacity rounded-md p-1 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
              aria-label="Edit task"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {/* Description */}
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed">{description}</p>
        )}

        {/* Assignee row + Reassign dropdown */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {assignee ? (
              <>
                <div className="h-6 w-6 rounded-full bg-muted border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                  {assignee.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={assignee.image} alt={assignee.name} className="h-full w-full object-cover" />
                  ) : (
                    <span className="text-xs font-bold text-muted-foreground">
                      {assignee.name.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{assignee.name}</span>
              </>
            ) : (
              <span className="text-xs text-muted-foreground/50 italic">Unassigned</span>
            )}
          </div>

          {/* Reassign dropdown — visible on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity">
            <ReassignDropdown
              currentAssigneeId={assigneeId}
              members={allMembers}
              onReassign={handleReassign}
            />
          </div>
        </div>

        {/* Save error */}
        {saveError && (
          <p className="text-[10px] text-destructive font-mono">{saveError}</p>
        )}
      </div>

      {/* Edit panel — expands below card when editing */}
      {isEditing && (
        <EditTaskPanel
          initialName={name}
          initialDescription={description}
          onSave={handleSaveEdit}
          onCancel={() => setIsEditing(false)}
          isSaving={isSaving}
        />
      )}

      {/* Rationale / override / uncertainty */}
      {!isEditing && (
        <>
          {isHumanOverride ? (
            <HumanOverrideBadge />
          ) : lowConfidence ? (
            <AiUncertainty label={lowConfidenceNote ?? "Low confidence"}>
              {aiRationale && (
                <p className="text-xs text-muted-foreground/70 mt-1">{aiRationale}</p>
              )}
            </AiUncertainty>
          ) : aiRationale ? (
            <AiRationaleCallout>{aiRationale}</AiRationaleCallout>
          ) : null}
        </>
      )}
    </div>
  );
}
