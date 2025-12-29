import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import ProcessFlow from "@/components/landing/ProcessFlow";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AnalyticsPreview from "@/components/landing/AnalyticsPreview";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProcessFlow />
      <FeaturesSection />
      <AnalyticsPreview />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
