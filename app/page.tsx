import { SiteFooter } from "@/components/layout/site-footer";
import { AudiencesSection } from "@/components/landing/audiences-section";
import { CtaSection } from "@/components/landing/cta-section";
import { FaqSection } from "@/components/landing/faq-section";
import { FeaturesSection } from "@/components/landing/features-section";
import { HeroSection } from "@/components/landing/hero-section";
import { HowItWorksSection } from "@/components/landing/how-it-works-section";
import { LandingNav } from "@/components/landing/landing-nav";
import { PricingSection } from "@/components/landing/pricing-section";
import { ScoringSection } from "@/components/landing/scoring-section";

export default async function HomePage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-[#F5F7FA]">
      <LandingNav />
      <main className="flex-1">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <AudiencesSection />
        <PricingSection />
        <ScoringSection />
        <FaqSection />
        <CtaSection />
      </main>
      <SiteFooter />
    </div>
  );
}
