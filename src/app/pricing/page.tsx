import { Metadata } from "next";
import { SiteNav } from "@/components/marketing/SiteNav";
import { Footer } from "@/components/marketing/Footer";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { PageHero } from "@/components/product/PageHero";
import { PricingCards } from "@/components/pricing/PricingCards";
import { WhyFreeSection } from "@/components/pricing/WhyFreeSection";
import { PricingFaq } from "@/components/pricing/PricingFaq";

export const metadata: Metadata = {
  title: "Pricing — Paceup",
  description: "Simple pricing. No AI markup. Bring your own API key and use Paceup for free.",
};

export default function PricingPage() {
  return (
    <div className="relative min-h-screen bg-background">
      <SiteNav />

      <main className="pt-16">
        <PageHero
          title="Simple pricing. No AI markup."
          subtitle="Stop paying premium subscriptions for wrapper apps. Bring your own key, pay your provider directly, and use Paceup for free."
        />

        <PricingCards />
        
        <WhyFreeSection />

        <PricingFaq />

        <FinalCTA />
      </main>

      <Footer />
    </div>
  );
}
