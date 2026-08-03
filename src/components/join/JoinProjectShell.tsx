"use client";

import { useState, useCallback } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import { X, Users, Calendar } from "lucide-react";
import Link from "next/link";
import { WizardProgressBar } from "@/components/wizard/WizardProgressBar";
import { WizardNav } from "@/components/wizard/WizardNav";
import { WizardStepPlaceholder } from "@/components/wizard/WizardStepPlaceholder";
import { SkillsSetupStep } from "./steps/SkillsSetupStep";
import { AvailabilityStep } from "./steps/AvailabilityStep";
import { ResumeUploadStep } from "./steps/ResumeUploadStep";
import { ReviewJoinStep } from "./steps/ReviewJoinStep";
import type { JoinProjectStep, JoinProjectFormData } from "@/types/join";
import type { SlideDirection } from "@/types/wizard";

const JOIN_STEPS: JoinProjectStep[] = [
  {
    index: 0,
    label: "Skills & Role",
    heading: "Your Role in this Project",
    description: "Define how you can best contribute to the team.",
    isSkippable: false,
  },
  {
    index: 1,
    label: "Availability",
    heading: "Time & Availability",
    description: "Set your weekly commitment and timezone.",
    isSkippable: false,
  },
  {
    index: 2,
    label: "Resume",
    heading: "Upload Resume",
    description: "Optional, but helps the AI assign tasks accurately.",
    isSkippable: true,
  },
  {
    index: 3,
    label: "Review",
    heading: "Review & Join",
    description: "Confirm your details before joining the project.",
    isSkippable: false,
  },
];

// Re-using the wizard slide variants
const buildSlideVariants = (direction: SlideDirection): Variants => ({
  enter: {
    x: direction === "forward" ? 40 : -40,
    opacity: 0,
    scale: 0.98,
  },
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
    transition: { type: "spring", stiffness: 350, damping: 30, mass: 0.8 },
  },
  exit: {
    x: direction === "forward" ? -40 : 40,
    opacity: 0,
    scale: 0.98,
    transition: { type: "spring", stiffness: 350, damping: 30, mass: 0.8 },
  },
});

interface JoinProjectShellProps {
  projectId: string;
  inviteToken: string;
  project: {
    title: string;
    memberCount: number;
    deadline: string | null;
  };
  initialGlobalSkills?: { name: string; confidence: "Comfortable" | "Learning" }[];
}

export function JoinProjectShell({ projectId, inviteToken, project, initialGlobalSkills }: JoinProjectShellProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<SlideDirection>("forward");

  const [formData, setFormData] = useState<JoinProjectFormData>({
    skills: initialGlobalSkills ?? [],
    rolePreference: "",
    interests: "",
    weeklyHours: 10,
    otherProjects: false,
    timezone: "UTC (Coordinated Universal Time)",
  });

  const [canContinue, setCanContinue] = useState(false);

  const currentStep = JOIN_STEPS[currentIndex];
  const isFirstStep = currentIndex === 0;
  const isLastStep = currentIndex === JOIN_STEPS.length - 1;

  const updateForm = useCallback((updates: Partial<JoinProjectFormData>) => {
    setFormData((prev) => ({ ...prev, ...updates }));
  }, []);

  const goForward = useCallback(() => {
    if (currentIndex >= JOIN_STEPS.length - 1) return;
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

  const jumpToStep = useCallback((index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? "forward" : "back");
    setCurrentIndex(index);
  }, [currentIndex]);

  const handleContinueOrFinish = useCallback(() => {
    if (isLastStep) {
      // The final step has its own "Join Project" button that triggers the action.
      // This is here as a fallback in case WizardNav somehow triggers it.
      document.getElementById("review-join-trigger")?.click();
    } else {
      goForward();
    }
  }, [isLastStep, goForward]);

  const slideVariants = buildSlideVariants(direction);

  const renderCurrentStep = () => {
    switch (currentIndex) {
      case 0:
        return (
          <SkillsSetupStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 1:
        return (
          <AvailabilityStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
          />
        );
      case 2:
        return (
          <ResumeUploadStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
            projectId={projectId}
          />
        );
      case 3:
        return (
          <ReviewJoinStep
            step={currentStep}
            formData={formData}
            updateForm={updateForm}
            setCanContinue={setCanContinue}
            projectId={projectId}
            inviteToken={inviteToken}
            onNavigateToStep={jumpToStep}
          />
        );
      default:
        return <WizardStepPlaceholder step={currentStep as any} />;
    }
  };

  const deadlineFormatted = project.deadline
    ? new Date(project.deadline).toLocaleDateString("en-GB", { month: "short", day: "numeric" })
    : null;

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-toxic/30 selection:text-toxic">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <h1 className="font-heading text-lg font-bold text-foreground">
              Joining <span className="text-toxic">{project.title}</span>
            </h1>
            <div className="hidden sm:flex items-center gap-3 ml-2 pl-4 border-l border-border/60">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" /> {project.memberCount} members
              </span>
              {deadlineFormatted && (
                <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Calendar className="h-3.5 w-3.5" /> Due {deadlineFormatted}
                </span>
              )}
            </div>
          </div>
          <Link
            href="/hub"
            className="rounded-full p-2 text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </Link>
        </div>
        <WizardProgressBar
          steps={JOIN_STEPS as any}
          currentIndex={currentIndex}
        />
      </header>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 overflow-x-hidden">
        <div className="mx-auto flex max-w-3xl flex-col items-center justify-center px-6 py-12 md:py-20">
          <AnimatePresence mode="wait" initial={false} custom={direction}>
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="w-full"
            >
              {renderCurrentStep()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* ── Footer Nav ────────────────────────────────────────────────────── */}
      {!isLastStep && (
        <WizardNav
          canContinue={canContinue}
          onContinue={handleContinueOrFinish}
          onBack={goBack}
          onSkip={skip}
          isFirstStep={isFirstStep}
          isLastStep={isLastStep}
          isSkippable={currentStep.isSkippable}
        />
      )}
    </div>
  );
}
