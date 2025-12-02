import { Sparkles } from "lucide-react";

export default function TrustSignals() {
  return (
    <div
      className="
        mt-10
        pt-10 pb-2
        animate-fade-in
        relative
      "
    >
      {/* Glow Übergang direkt vom Hero zum Dark Background */}
      <div className="absolute -top-6 left-0 right-0 h-10 bg-gradient-to-b from-primary/30 to-transparent blur-2xl pointer-events-none" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="flex flex-col items-center gap-4">
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
        </div>
      </div>

      {/* Entfernt: Glow Line unten → nicht mehr nötig */}
    </div>
  );
}
