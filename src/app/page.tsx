import { SiteNav } from "@/components/marketing/SiteNav";
import { HeroBackground } from "@/components/marketing/HeroBackground";
import { HeroSection } from "@/components/marketing/HeroSection";
import { ProblemSection } from "@/components/marketing/ProblemSection";
import { HowItWorksSection } from "@/components/marketing/HowItWorksSection";
import { FeatureHighlightsSection } from "@/components/marketing/FeatureHighlightsSection";
import { DifferentiatorSection } from "@/components/marketing/DifferentiatorSection";
import { TrustStrip } from "@/components/marketing/TrustStrip";
import { SocialProofSection } from "@/components/marketing/SocialProofSection";
import { FinalCTA } from "@/components/marketing/FinalCTA";
import { Footer } from "@/components/marketing/Footer";

export default function Home() {
  return (
    <div className="relative min-h-screen bg-background selection:bg-toxic/30 selection:text-foreground">
      {/* Ambient background animation */}
      <HeroBackground />
      
      {/* Sticky Navigation */}
      <SiteNav />
      
      {/* Main Content */}
      <main>
        {/* Hero Section */}
        <HeroSection />
        <ProblemSection />
        <HowItWorksSection />
        <FeatureHighlightsSection />
        <DifferentiatorSection />
        <TrustStrip />
        <SocialProofSection />
        <FinalCTA />
      </main>
      
      <Footer />
    </div>
  );
}
