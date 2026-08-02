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

export type AiProvider = "gemini" | "openai" | "anthropic" | "openrouter" | "groq" | "";

export type KeyPolicy = "owner_key" | "per_member_key";

/** A document that has been uploaded to Supabase Storage during the wizard. */
export interface UploadedDocument {
  /** Unique storage path — used to remove the file if needed */
  storagePath: string;
  /** Original filename displayed to the user */
  name: string;
  /** File size in bytes */
  sizeBytes: number;
  /** Public URL returned by Supabase after upload */
  url: string;
}

/** An invite sent during the wizard — stored locally and committed when the project is created. */
export interface StagedInvite {
  /** The resolved user's ID */
  userId: string;
  /** The resolved user's handle */
  handle: string;
  /** The resolved user's display name */
  name: string;
  /** The resolved user's avatar URL */
  image: string | null;
}

/** The result of encrypting a provider API key — stored in wizard state until project creation. */
export interface ProviderKeyState {
  provider: AiProvider;
  /** Envelope-encrypted ciphertext — never the plaintext */
  encryptedKey: string;
  policy: KeyPolicy;
  /** Indicates the key has been validated and encrypted; UI shows "Key saved" */
  isSaved: boolean;
}

export interface WizardFormData {
  title: string;
  problemStatement: string;
  solution: string;
  scope: string;
  type: ProjectType;
  deadline: string; // YYYY-MM-DD format
  techStack: string[];
  uploadedDocuments: UploadedDocument[];
  stagedInvites: StagedInvite[];
  providerKey: ProviderKeyState | null;
}

export interface WizardStepProps {
  step: WizardStep;
  formData: WizardFormData;
  updateForm: (updates: Partial<WizardFormData>) => void;
  setCanContinue: (can: boolean) => void;
}
