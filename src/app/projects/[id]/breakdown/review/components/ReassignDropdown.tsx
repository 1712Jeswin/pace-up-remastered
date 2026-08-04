"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check, UserX } from "lucide-react";

interface Member {
  userId: string;
  name: string;
  image: string | null;
}

interface ReassignDropdownProps {
  currentAssigneeId: string | null;
  members: Member[];
  onReassign: (userId: string | null, member: Member | null) => void;
}

export function ReassignDropdown({ currentAssigneeId, members, onReassign }: ReassignDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(member: Member | null) {
    onReassign(member?.userId ?? null, member);
    setIsOpen(false);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="inline-flex items-center gap-1 rounded-md border border-border/60 bg-muted/30 px-2 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
      >
        Reassign
        <ChevronDown className={`h-3 w-3 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 top-full z-50 mt-1 w-44 rounded-xl border border-border/60 bg-card shadow-xl shadow-black/20 overflow-hidden">
          {/* Unassign option */}
          <button
            type="button"
            onClick={() => handleSelect(null)}
            className="flex w-full items-center gap-2 px-3 py-2 text-xs text-muted-foreground hover:bg-muted/40 transition-colors"
          >
            <UserX className="h-3.5 w-3.5 shrink-0" />
            <span>Unassign</span>
            {currentAssigneeId === null && (
              <Check className="h-3 w-3 ml-auto text-toxic" />
            )}
          </button>

          <div className="h-px bg-border/40 mx-2" />

          {/* Member list */}
          {members.map((member) => (
            <button
              key={member.userId}
              type="button"
              onClick={() => handleSelect(member)}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-foreground hover:bg-muted/40 transition-colors"
            >
              {/* Avatar */}
              <div className="h-5 w-5 rounded-full bg-muted border border-border/60 overflow-hidden flex items-center justify-center shrink-0">
                {member.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={member.image} alt={member.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="text-[9px] font-bold text-muted-foreground">
                    {member.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="truncate">{member.name}</span>
              {currentAssigneeId === member.userId && (
                <Check className="h-3 w-3 ml-auto shrink-0 text-toxic" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
