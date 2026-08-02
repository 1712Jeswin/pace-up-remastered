export type ConfidenceLevel = "Comfortable" | "Learning";

export interface SkillEntry {
  name: string;
  confidence: ConfidenceLevel;
}

export type RolePreference = "Frontend" | "Backend" | "Design" | "Research" | "PM-ish" | "Flexible" | "";

export interface JoinProjectFormData {
  skills: SkillEntry[];
  rolePreference: RolePreference;
  interests: string;
  weeklyHours: number;
  otherProjects: boolean;
  timezone: string;
  // Phase 21 will add resume parsing summary
  resumeSummary?: string;
}

export interface JoinProjectStep {
  index: number;
  label: string;
  heading: string;
  description: string;
  isSkippable: boolean;
}

export interface JoinStepProps {
  step: JoinProjectStep;
  formData: JoinProjectFormData;
  updateForm: (updates: Partial<JoinProjectFormData>) => void;
  setCanContinue: (can: boolean) => void;
}
