"use client";

import { useState, useCallback, useEffect } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import Link from "next/link";
import { X } from "lucide-react";
import { WizardProgressBar } from "./WizardProgressBar";
import { WizardNav } from "./WizardNav";
import { WizardStepPlaceholder } from "./WizardStepPlaceholder";
import { ProjectDetailsStep } from "./steps/ProjectDetailsStep";
import { TechStackStep } from "./steps/TechStackStep";
import { SupportingDocsStep } from "./steps/SupportingDocsStep";
import { InviteTeamStep } from "./steps/InviteTeamStep";
import { AiProviderStep } from "./steps/AiProviderStep";
import { ReviewStep } from "./steps/ReviewStep";
import type { WizardStep, SlideDirection, WizardFormData } from "@/types/wizard";

// ─── Step definitions ─────────────────────────────────────────────────────────

const WIZARD_STEPS: WizardStep[] = [
  {
    index: 0,
    label: "Details",
    heading: "Project Details",
    description: "Give your project a name, describe the problem you're solving, and set a deadline.",
    isSkippable: false,
  },
  {
    index: 1,
    label: "Tech Stack",
    heading: "Tech Stack",
    description: "Select the languages, frameworks, and tools your team will use.",
    isSkippable: false,
  },
  {
    index: 2,
    label: "Documents",
    heading: "Upload Documents",
    description: "Upload briefs, rubrics, or requirements so Paceup can tailor your task breakdown.",
    isSkippable: true,
  },
  {
    index: 3,
    label: "Team",
    heading: "Invite Your Team",
    description: "Add team members by email or share an invite link. You can also do this later.",
    isSkippable: true,
  },
  {
    index: 4,
    label: "AI Provider",
    heading: "Connect Your AI Provider",
    description: "Enter your API key for Google Gemini, OpenAI, or Anthropic. Your key is encrypted immediately.",
    isSkippable: false,
  },
  {
    index: 5,
    label: "Review",
    heading: "Review & Create",
    description: "Check everything looks right before Paceup generates your project structure.",
    isSkippable: false,
  },
];

// ─── Slide transition variants ────────────────────────────────────────────────

const SLIDE_DISTANCE = 48; // px

function buildSlideVariants(direction: SlideDirection): Variants {
  const sign = direction === "forward" ? 1 : -1;
  return {
    enter: {
      x: sign * SLIDE_DISTANCE,
      opacity: 0,
    },
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.25, ease: [0.33, 1, 0.68, 1] },
    },
    exit: {
      x: -sign * SLIDE_DISTANCE,
      opacity: 0,
      transition: { duration: 0.2, ease: [0.83, 0, 0.17, 1] },
    },
  };
}

// ─── Shell ────────────────────────────────────────────────────────────────────

export function WizardShell() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>("forward");

  // State for all steps
  const [formData, setFormData] = useState<WizardFormData>({
    title: "",
    problemStatement: "",
    solution: "",
    scope: "",
    type: "",
    deadline: "",
    techStack: [],
    uploadedDocuments: [],
    stagedInvites: [],
    providerKey: null,
  });

  const [canContinue, setCanContinue] = useState(false);

  const currentStep = WIZARD_STEPS[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === WIZARD_STEPS.length - 1;

  const updateForm = useCallback((updates: Partial<WizardFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goForward = useCallback(() => {
    if (currentIndex >= WIZARD_STEPS.length - 1) return;
    setDirection("forward");
    setCurrentIndex((prev) => prev + 1);
  }, [currentIndex]);

  const goBack = useCallback(() => {
    if (currentIndex <= 0) return;
    setDirection("back");
    setCurrentIndex((prev) => prev - 1);
  }, [currentIndex]);

  const skip = useCallback(() => {
    goForward();
  }, [goForward]);

  const handleFinish = useCallback(() => {
    // Delegate to the hidden trigger button inside ReviewStep,
    // which calls createProjectAction and handles the redirect.
    const btn = document.getElementById("create-project-trigger");
    if (btn instanceof HTMLButtonElement) btn.click();
  }, []);

  // Navigate to any step directly — used by ReviewStep Edit links
  const goToStep = useCallback((targetIndex: number) => {
    const dir: SlideDirection = targetIndex < currentIndex ? "back" : "forward";
    setDirection(dir);
    setCurrentIndex(targetIndex);
  }, [currentIndex]);

  const handleContinueOrFinish = useCallback(() => {
    if (isLastStep) {
      handleFinish();
    } else {
      goForward();
    }
  }, [isLastStep, handleFinish, goForward]);

  const slideVariants = buildSlideVariants(direction);

  // Render the current step component
  const renderCurrentStep = () => {
    switch (currentIndex) {
      case 0:
        return (
          <ProjectDetailsStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 1:
        return (
          <TechStackStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 2:
        return (
          <SupportingDocsStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 3:
        return (
          <InviteTeamStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 4:
        return (
          <AiProviderStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 5:
        return (
          <ReviewStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
            onNavigateToStep={goToStep}
          />
        );
      default:
        return <WizardStepPlaceholder step={currentStep} />;
    }
  };

  // Ensure placeholders always allow continuing
  useEffect(() => {
    if (currentIndex > 0) {
      setCanContinue(true);
    }
  }, [currentIndex]);

  // When navigating back/forward to placeholders, ensure canContinue defaults correctly.
  // The useEffect inside ProjectDetailsStep handles its own validation.
  
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ── Top bar ─────────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 border-b border-border bg-background/90 backdrop-blur-sm">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-6">
            <Link
              id="wizard-cancel"
              href="/projects"
              aria-label="Cancel and return to projects"
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border text-muted-foreground hover:border-border/80 hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </Link>

            <div className="flex-1">
              <WizardProgressBar steps={WIZARD_STEPS} currentIndex={currentIndex} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Step content ────────────────────────────────────────────────────── */}
      <div className="flex-1 flex items-start justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="w-full max-w-2xl">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentIndex}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>

          {/* ── Navigation ──────────────────────────────────────────────────── */}
          <WizardNav
            isFirstStep={isFirstStep}
            isLastStep={isLastStep}
            isSkippable={currentStep.isSkippable}
            canContinue={canContinue}
            onBack={goBack}
            onContinue={handleContinueOrFinish}
            onSkip={skip}
          />
        </div>
      </div>
    </div>
  );
}
