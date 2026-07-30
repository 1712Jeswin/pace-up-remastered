import { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Footer } from "@/components/marketing/Footer";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageHero } from "@/components/product/PageHero";
import { CorePromisesStrip } from "@/components/security/CorePromisesStrip";
import { ApiKeyProtectionSection } from "@/components/security/ApiKeyProtectionSection";
import { DataHandlingSection } from "@/components/security/DataHandlingSection";
import { DataIsolationSection } from "@/components/security/DataIsolationSection";
import { AccountDeletionSection } from "@/components/security/AccountDeletionSection";
import { UniversityCallout } from "@/components/security/UniversityCallout";
import { SecurityContactSection } from "@/components/security/SecurityContactSection";

export const metadata: Metadata = {
  title: "Security & Privacy — Paceup",
  description:
    "Your code. Your keys. Your control. Learn how Paceup encrypts your API keys, handles your data, and lets you delete everything at any time.",
};

export default function SecurityPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteNav />

      <main className="pt-16">
        <PageHero
          title="Your Code. Your Keys. Your Control."
          subtitle="We built Paceup on a BYOAI model for one reason: your data should never pass through an AI provider you did not choose yourself."
        />

        <CorePromisesStrip />

        <ApiKeyProtectionSection />

        <DataHandlingSection />

        <DataIsolationSection />

        <AccountDeletionSection />

        <UniversityCallout />

        <SecurityContactSection />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
