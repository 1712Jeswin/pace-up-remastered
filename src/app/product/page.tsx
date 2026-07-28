import { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Footer } from "@/components/marketing/Footer";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { StageCard } from "@/components/product/StageCard";
import {
  CreateProjectMock,
  AiBreakdownMock,
  TeamAssignmentMock,
  OnTrackMock,
} from "@/components/product/StageMocks";
import { ProductFeatureGrid } from "@/components/product/ProductFeatureGrid";
import { ComparisonTable } from "@/components/product/ComparisonTable";
import { FaqAccordion } from "@/components/product/FaqAccordion";
import { PageHero } from "@/components/product/PageHero";
import { FolderPlus, BrainCircuit, Users, Target } from "lucide-react";

export const metadata: Metadata = {
  title: "How It Works — Paceup",
  description:
    "See how Paceup's AI breaks down your project, assigns your team, and leads them to the finish line — step by step.",
};

const stages = [
  {
    id: "stage-create",
    label: "Step 01",
    title: "Create Your Project",
    description:
      "Describe your project in plain language — a feature spec, a hackathon brief, a bug report. That's it. Paceup handles the rest.",
    detail:
      "No templates. No rigid structures. Just describe what you want to build and the AI takes it from there.",
    icon: <FolderPlus className="h-6 w-6 text-toxic" />,
    mock: <CreateProjectMock />,
    reverse: false,
  },
  {
    id: "stage-breakdown",
    label: "Step 02",
    title: "AI Breaks It Down",
    description:
      "The AI agent generates a complete, structured technical plan: epics, tasks, sub-tasks, acceptance criteria, and dependencies — all in seconds.",
    detail:
      "Every task includes a rationale. You see exactly why the AI made each decision and can override any of them.",
    icon: <BrainCircuit className="h-6 w-6 text-toxic" />,
    mock: <AiBreakdownMock />,
    reverse: true,
  },
  {
    id: "stage-assign",
    label: "Step 03",
    title: "Team Gets Matched & Assigned",
    description:
      "Tasks are automatically matched to the right team member based on their skills, workload, and availability — not just round-robin.",
    detail:
      "All assignments are transparent and editable. Reassign with a click; the AI adapts and adjusts dependent tasks accordingly.",
    icon: <Users className="h-6 w-6 text-toxic" />,
    mock: <TeamAssignmentMock />,
    reverse: false,
  },
  {
    id: "stage-track",
    label: "Step 04",
    title: "AI Keeps You On Track",
    description:
      "Paceup conducts daily asynchronous standups with each team member, aggregates updates, surfaces blockers, and nudges when things go quiet.",
    detail:
      "You get a single, clear status summary every morning — no meetings required. The AI handles escalation so you don't have to.",
    icon: <Target className="h-6 w-6 text-toxic" />,
    mock: <OnTrackMock />,
    reverse: true,
  },
];

export default function ProductPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteNav />

      <main className="pt-16">
        {/* Page Header */}
        <PageHero
          title="How Paceup Works"
          subtitle="Four stages. One AI that leads from start to finish."
        />

        {/* Four Stage Deep Dives */}
        <section className="py-24 sm:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl space-y-32">
            {stages.map((stage) => (
              <StageCard
                key={stage.id}
                stageId={stage.id}
                label={stage.label}
                reverse={stage.reverse}
                title={stage.title}
                description={stage.description}
                detail={stage.detail}
                icon={stage.icon}
                mockContent={stage.mock}
              />
            ))}
          </div>
        </section>

        {/* Feature Grid */}
        <ProductFeatureGrid />

        {/* Comparison Table */}
        <ComparisonTable />

        {/* FAQ Accordion */}
        <FaqAccordion />

        {/* Final CTA */}
        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
