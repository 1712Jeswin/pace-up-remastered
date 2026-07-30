// Wizard step definition — drives both the progress indicator and the shell router.

export interface WizardStep {
  /** 0-based index */
  index: number;
  /** Short label shown below the progress dot */
  label: string;
  /** Full heading shown inside the step body */
  heading: string;
  /** Brief description shown below the heading in the placeholder */
  description: string;
  /** If true, a "Skip" button is shown alongside Back/Continue */
  isSkippable: boolean;
}

/** Direction of the pending slide transition */
export type SlideDirection = "forward" | "back";

export type ProjectType = "Hackathon" | "Final-Year Project" | "Coursework" | "Club Project" | "Research" | "";

export interface WizardFormData {
  title: string;
  problemStatement: string;
  solution: string;
  scope: string;
  type: ProjectType;
  deadline: string; // YYYY-MM-DD format
}

export interface WizardStepProps {
  step: WizardStep;
  formData: WizardFormData;
  updateForm: (updates: Partial<WizardFormData>) => void;
  setCanContinue: (can: boolean) => void;
}
