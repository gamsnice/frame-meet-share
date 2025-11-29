import { Sparkles } from "lucide-react";

export default function TrustSignals() {
  return (
    <div className="border-t border-border/30 bg-gradient-card/30 py-6 animate-fade-in">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center gap-4">
          {/* Social Proof Line */}
          <div className="flex items-center gap-2 text-center">
            <Sparkles className="h-5 w-5 text-primary animate-pulse" />
            <p className="text-sm md:text-base text-muted-foreground">
              <span className="font-semibold text-foreground">Trusted by small and big event organizers</span> as one of the most cost-efficient marketing tools
            </p>
            <Sparkles className="h-5 w-5 text-secondary animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>

          {/* Event Types & Stats */}
          <div className="flex flex-wrap items-center justify-center gap-4 md:gap-8 text-xs md:text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              🎤 Conferences
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
              🤝 Meetups
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
              🎪 Festivals
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/10 border border-secondary/20">
              🏢 Corporate Events
            </span>
          </div>

          {/* Quick Stats */}
          <div className="flex items-center gap-6 text-xs md:text-sm">
            <div className="text-center">
              <div className="font-bold text-primary text-lg md:text-xl">500+</div>
              <div className="text-muted-foreground">Events Created</div>
            </div>
            <div className="h-8 w-px bg-border/50"></div>
            <div className="text-center">
              <div className="font-bold text-secondary text-lg md:text-xl">10,000+</div>
              <div className="text-muted-foreground">Visuals Generated</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
