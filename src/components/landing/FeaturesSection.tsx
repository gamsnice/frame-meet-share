import { Card } from "@/components/ui/card";
import { Sparkles, Users, LayoutTemplate, BarChart3 } from "lucide-react";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

const features = [
  {
    icon: LayoutTemplate,
    title: "Launch in 5 Minutes, Not 5 Days",
    description:
      "Create events, upload branded templates, and control everything from one simple dashboard. No design skills required.",
    variant: "primary" as const,
  },
  {
    icon: Sparkles,
    title: "Custom Branding for every Event",
    description:
      "Your colors, your logo, your templates, your captions - working together to deliver your corporate identity perfectly in every post.",
    variant: "secondary" as const,
  },
  {
    icon: Users,
    title: "Perfect for Every Platform",
    description:
      "Square, story, landscape, portrait - all formats optimized for LinkedIn, Instagram, X, and more. One click to share everywhere.",
    variant: "primary" as const,
  },
  {
    icon: BarChart3,
    title: "Know What's Working, Instantly",
    description:
      "Real-time engagement metrics show you views, uploads, downloads, and peak activity times. See how templates perform.",
    variant: "secondary" as const,
  },
];

export default function FeaturesSection() {
  return (
    <section className="py-28 bg-background">
      <div className="container mx-auto px-4">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              <span className="bg-gradient-accent bg-clip-text text-transparent">Powerful Features</span> Simple Setup
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:gap-10 md:grid-cols-2 lg:grid-cols-4 max-w-7xl mx-auto">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            const isSecondary = feature.variant === "secondary";
            const animation = index % 2 === 0 ? "slide-left" : "slide-right";

            return (
              <ScrollReveal
                key={feature.title}
                animation={animation}
                delay={100 * index}
                duration={700}
              >
                <Card
                  className={`p-8 bg-card/80 backdrop-blur-sm border-border/50 transition-all duration-300 h-full group ${
                    isSecondary
                      ? "hover:border-secondary/50 hover:shadow-glow-orange"
                      : "hover:border-primary/50 hover:shadow-glow"
                  }`}
                >
                  <div
                    className={`mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg transition-colors ${
                      isSecondary
                        ? "bg-secondary/10 group-hover:bg-secondary/20"
                        : "bg-primary/10 group-hover:bg-primary/20"
                    }`}
                  >
                    <Icon className={`h-6 w-6 ${isSecondary ? "text-secondary" : "text-primary"}`} />
                  </div>
                  <h3 className="mb-3 text-xl font-bold">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </Card>
              </ScrollReveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
