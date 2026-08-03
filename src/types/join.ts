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
  /** AI-generated (and possibly user-edited) experience summary from resume parsing. */
  resumeSummary?: string;
  /** Supabase Storage path of the uploaded resume — used for deletion on skip/change. */
  resumeStoragePath?: string;
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
