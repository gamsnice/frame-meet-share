import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Palette, Eye, Gift } from "lucide-react";
export default function FeaturesShowcase() {
  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Real Events, <span className="bg-gradient-accent bg-clip-text text-transparent">Real Results</span>
          </h2>
          <p className="text-lg text-muted-foreground">What other Event Organizers are saying</p>
        </div>

        {/* Bottom CTA */}
        <div
          className="mt-12 text-center animate-fade-in"
          style={{
            animationDelay: "0.3s",
          }}
        ></div>
      </div>
    </section>
  );
}
