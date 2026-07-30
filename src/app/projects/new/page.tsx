import { Metadata } from "next";
import { WizardShell } from "@/components/wizard/WizardShell";

export const metadata: Metadata = {
  title: "Create Project — Paceup",
  description: "Set up a new project in Paceup.",
};

export default function NewProjectPage() {
  return <WizardShell />;
}
