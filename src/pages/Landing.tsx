import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import Navigation from "@/components/landing/Navigation";
import HeroSection from "@/components/landing/HeroSection";
import ProcessFlow from "@/components/landing/ProcessFlow";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import AnalyticsPreview from "@/components/landing/AnalyticsPreview";
import PricingSection from "@/components/landing/PricingSection";
import FAQSection from "@/components/landing/FAQSection";
import ContactSection from "@/components/landing/ContactSection";
import Footer from "@/components/landing/Footer";

export default function Landing() {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        await (supabase.from("page_views" as any) as any).insert({
          page_path: "/",
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
      }
    };
    trackPageView();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <HeroSection />
      <ProcessFlow />
      <TestimonialsSection />
      <FeaturesSection />
      <AnalyticsPreview />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
