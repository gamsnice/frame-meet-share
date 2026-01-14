import { LayoutTemplate, Upload, Share2, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function ProcessFlow() {
  const steps = [
    {
      icon: LayoutTemplate,
      step: 1,
      title: "Event Visuals Backend",
      description:
        "Upload your branded templates, define the photo area, and see your frames instantly ready for attendees.",
      variant: "primary" as const,
    },
    {
      icon: Upload,
      step: 2,
      title: "Self-serve photo uploader",
      description:
        "Attendees drop in their photo, adjust the positioning, and preview the final visual in seconds. Photos aren't stored - only used to generate their download.",
      variant: "secondary" as const,
    },
    {
      icon: Share2,
      step: 3,
      title: "Download & Share",
      description:
        "With one click, attendees download their on-brand visual and share it to LinkedIn, Instagram & more - using your pre-written caption suggestions.",
      variant: "primary" as const,
    },
  ];

  return (
    <section id="how-it-works" className="py-28 bg-muted/15 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              From Setup to <span className="bg-gradient-accent bg-clip-text text-transparent">Viral Reach</span> in
              Minutes
            </h2>
          </div>
        </ScrollReveal>

        <div className="grid gap-8 md:gap-10 md:grid-cols-3 max-w-6xl mx-auto">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isSecondary = step.variant === "secondary";

            return (
              <ScrollReveal
                key={step.step}
                animation="fade-up"
                delay={150 * index}
                duration={700}
              >
                <div className="relative h-full">
                  <Card
                    className={`p-8 bg-card/80 backdrop-blur-sm border-border/50 h-full group transition-all duration-300 ${
                      isSecondary
                        ? "hover:border-secondary/50 hover:shadow-glow-orange"
                        : "hover:border-primary/50 hover:shadow-glow"
                    }`}
                  >
                    <div className="mb-6 flex items-center justify-between">
                      <div
                        className={`flex h-14 w-14 items-center justify-center rounded-full transition-colors ${
                          isSecondary
                            ? "bg-secondary/10 group-hover:bg-secondary/20"
                            : "bg-primary/10 group-hover:bg-primary/20"
                        }`}
                      >
                        <Icon className={`h-7 w-7 ${isSecondary ? "text-secondary" : "text-primary"}`} />
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-lg shadow-glow">
                        {step.step}
                      </div>
                    </div>

                    <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </Card>

                  {/* Arrow connector - Desktop only */}
                  {index < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-5 -translate-y-1/2 z-20">
                      <ArrowRight
                        className={`h-8 w-8 animate-bounce-subtle ${
                          isSecondary ? "text-secondary" : "text-primary"
                        }`}
                        style={{ animationDelay: `${index * 0.2}s` }}
                      />
                    </div>
                  )}
                </div>
              </ScrollReveal>
            );
          })}
        </div>

        {/* Bottom emphasis */}
        <ScrollReveal animation="fade-up" delay={500} duration={600}>
          <div className="mt-10 text-center">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">⚡ Average setup time: 5 minutes</span>
            </p>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
