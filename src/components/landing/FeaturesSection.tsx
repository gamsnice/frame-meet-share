import { Card } from "@/components/ui/card";
import { Sparkles, Users, LayoutTemplate, BarChart3 } from "lucide-react";

export default function FeaturesSection() {
  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-accent bg-clip-text text-transparent">Powerful Features</span> Simple Setup
          </h2>
        </div>

        <div className="grid gap-6 md:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <LayoutTemplate className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Launch in 5 Minutes, Not 5 Days</h3>
            <p className="text-muted-foreground mb-3">
              Create events, upload branded templates, and control everything from one simple dashboard. No design
              skills required.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/50 hover:shadow-glow-orange transition-all duration-300 group">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <Sparkles className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Custom Branding for every Event</h3>
            <p className="text-muted-foreground mb-3">
              Your colors, your logo, your templates, your captions - working together to deliver your corporate
              identity perfectly in every post.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Perfect for Every Platform</h3>
            <p className="text-muted-foreground mb-3">
              Square, story, landscape, portrait - all formats optimized for LinkedIn, Instagram, X, and more. One
              click to share everywhere.
            </p>
          </Card>

          <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/50 hover:shadow-glow-orange transition-all duration-300 group">
            <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
              <BarChart3 className="h-6 w-6 text-secondary" />
            </div>
            <h3 className="mb-3 text-xl font-bold">Know What's Working, Instantly</h3>
            <p className="text-muted-foreground mb-3">
              Real-time engagement metrics show you views, uploads, downloads, and peak activity times. See how
              templates perform.
            </p>
          </Card>
        </div>
      </div>
    </section>
  );
}
