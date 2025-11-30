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
            Powerful Features, <span className="bg-gradient-accent bg-clip-text text-transparent">Simple Setup</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to create a viral event marketing campaign
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Custom Branding */}
          <Card className="p-8 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-300 animate-fade-in">
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Palette className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mb-3 text-xl font-bold">Custom Branding</h3>
            <p className="text-muted-foreground mb-6">
              Your colors, your logo, your brand—everywhere. Upload custom templates and add your event's homepage and
              social links.
            </p>

            {/* Visual Preview */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-lg bg-muted/30 border border-border/30 text-center">
                <div className="mb-2 text-xs text-muted-foreground">Generic</div>
                <div className="h-20 bg-gradient-to-br from-muted to-muted/50 rounded flex items-center justify-center">
                  <div className="text-xs text-muted-foreground">Basic</div>
                </div>
              </div>
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30 text-center">
                <div className="mb-2 text-xs text-primary font-semibold">Branded</div>
                <div className="h-20 bg-gradient-accent rounded flex items-center justify-center animate-glow-pulse">
                  <div className="text-xs text-primary-foreground font-bold">Your Brand</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Real-Time Preview */}
          <Card
            className="p-8 bg-background/50 backdrop-blur-sm border-border/50 hover:border-secondary/30 hover:shadow-glow-orange transition-all duration-300 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10">
              <Eye className="h-7 w-7 text-secondary" />
            </div>

            <h3 className="mb-3 text-xl font-bold">Real-Time Customization Preview</h3>
            <p className="text-muted-foreground mb-6">
              See exactly how visuals look before sharing. Attendees can adjust photo position and zoom with instant
              preview.
            </p>

            {/* Visual Preview - Animated */}
            <div className="relative p-4 rounded-lg bg-muted/30 border border-border/30">
              <div className="aspect-square bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="w-24 h-24 rounded-full bg-gradient-accent animate-pulse-glow"
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </div>
                <Eye className="h-8 w-8 text-muted-foreground/50 relative z-10" />
              </div>
              <div className="mt-2 text-center text-xs text-muted-foreground">Live Preview</div>
            </div>
          </Card>

          {/* Referral System - Coming Soon */}
          <Card
            className="p-8 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-all duration-300 relative animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <Badge className="absolute top-4 right-4 bg-gradient-accent text-primary-foreground border-0">
              Coming Soon
            </Badge>

            <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <Gift className="h-7 w-7 text-primary" />
            </div>

            <h3 className="mb-3 text-xl font-bold">Referral Rewards</h3>
            <p className="text-muted-foreground mb-6">
              Refer friends and earn premium templates. Help other organizers discover meetme and unlock exclusive
              features.
            </p>

            {/* Visual Preview */}
            <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-secondary/10 border border-border/30 text-center">
              <div className="mb-3 text-3xl">🎁</div>
              <div className="text-sm font-semibold text-foreground mb-1">Invite Friends</div>
              <div className="text-xs text-muted-foreground">Earn premium templates & features</div>
              <div className="mt-4 flex justify-center gap-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-2 w-8 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-accent animate-pulse"
                      style={{ width: `${i * 33}%`, animationDelay: `${i * 0.2}s` }}
                    ></div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">All features included</span> • No hidden costs • Cancel
            anytime
          </p>
        </div>
      </div>
    </section>
  );
}
