import { Sparkles } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function TrustSignals() {
  return (
    <div className="mt-16 pt-12 pb-0">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="flex flex-col items-center gap-6">
            {/* Social Proof Line */}
            <div className="flex items-center gap-2 text-center">
              <Sparkles className="h-5 w-5 text-primary animate-pulse" />

              <p className="text-sm md:text-base text-muted-foreground">
                <span className="font-semibold text-foreground">Trusted by event organizers of all sizes</span> as one of
                the most cost-efficient marketing tools
              </p>

              <Sparkles className="h-5 w-5 text-secondary animate-pulse" style={{ animationDelay: "0.5s" }} />
            </div>

            {/* Event Types */}
            <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
              {[
                { emoji: "🎤", label: "Conferences", variant: "primary" },
                { emoji: "🤝", label: "Meetups", variant: "secondary" },
                { emoji: "🎪", label: "Festivals", variant: "primary" },
                { emoji: "🏢", label: "Corporate Events", variant: "secondary" },
              ].map((item, index) => (
                <ScrollReveal key={item.label} animation="fade-up" delay={100 + index * 80} duration={500}>
                  <span
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${
                      item.variant === "primary"
                        ? "bg-primary/10 border-primary/20"
                        : "bg-secondary/10 border-secondary/20"
                    }`}
                  >
                    {item.emoji} {item.label}
                  </span>
                </ScrollReveal>
              ))}
            </div>
          </div>
        </ScrollReveal>
      </div>

      {/* Glow Line */}
      <div className="mt-8 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
    </div>
  );
}
