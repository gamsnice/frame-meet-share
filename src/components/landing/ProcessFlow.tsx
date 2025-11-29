import { LayoutTemplate, Upload, Share2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";

export default function ProcessFlow() {
  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            From Setup to <span className="bg-gradient-accent bg-clip-text text-transparent">Viral Reach</span> in Minutes
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            The simplest way to turn your attendees into powerful brand ambassadors
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-3 max-w-6xl mx-auto">
          {/* Step 1 */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.1s" }}>
            <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 h-full group">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <LayoutTemplate className="h-7 w-7 text-primary" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-lg shadow-glow">
                  1
                </div>
              </div>
              
              <h3 className="mb-3 text-xl font-bold">Choose Template</h3>
              <p className="text-muted-foreground mb-4">
                Select from pre-designed templates or upload your own branded frames. Define where photos fit in seconds.
              </p>
              
              {/* Visual mockup placeholder */}
              <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex items-center justify-center">
                  <LayoutTemplate className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </div>
            </Card>

            {/* Arrow connector - Desktop only */}
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
              <ArrowRight className="h-8 w-8 text-primary animate-bounce-subtle" />
            </div>
          </div>

          {/* Step 2 */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/50 hover:shadow-glow-orange transition-all duration-300 h-full group">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <Upload className="h-7 w-7 text-secondary" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-lg shadow-glow">
                  2
                </div>
              </div>
              
              <h3 className="mb-3 text-xl font-bold">Upload Your Photo</h3>
              <p className="text-muted-foreground mb-4">
                Attendees simply drag their selfie, adjust position and zoom, and preview the final result instantly.
              </p>
              
              {/* Visual mockup placeholder */}
              <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <div className="aspect-square bg-gradient-to-br from-secondary/20 to-primary/20 rounded-lg flex items-center justify-center animate-pulse-glow">
                  <Upload className="h-12 w-12 text-muted-foreground/50" />
                </div>
              </div>
            </Card>

            {/* Arrow connector - Desktop only */}
            <div className="hidden md:block absolute top-1/2 -right-4 -translate-y-1/2 z-20">
              <ArrowRight className="h-8 w-8 text-secondary animate-bounce-subtle" style={{ animationDelay: "0.2s" }} />
            </div>
          </div>

          {/* Step 3 */}
          <div className="relative animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 h-full group">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Share2 className="h-7 w-7 text-primary" />
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-lg shadow-glow">
                  3
                </div>
              </div>
              
              <h3 className="mb-3 text-xl font-bold">Download & Share</h3>
              <p className="text-muted-foreground mb-4">
                One click downloads the perfect visual. Direct buttons for LinkedIn and Instagram make sharing effortless.
              </p>
              
              {/* Visual mockup placeholder with social icons */}
              <div className="mt-4 p-4 rounded-lg bg-background/50 border border-border/30">
                <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg flex flex-col items-center justify-center gap-3">
                  <Share2 className="h-12 w-12 text-muted-foreground/50" />
                  <div className="flex gap-2">
                    <div className="h-6 w-6 rounded bg-muted/50"></div>
                    <div className="h-6 w-6 rounded bg-muted/50"></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Bottom emphasis */}
        <div className="mt-12 text-center animate-fade-in" style={{ animationDelay: "0.4s" }}>
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">⚡ Average setup time: 5 minutes</span> • No design skills required
          </p>
        </div>
      </div>
    </section>
  );
}
