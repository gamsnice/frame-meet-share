import { Card } from "@/components/ui/card";
import { Quote } from "lucide-react";

export default function TestimonialsSection() {
  const testimonials = [
    {
      quote: "meetme helped us generate 500+ social shares in the first week. The setup took literally 10 minutes.",
      name: "Sarah Chen",
      role: "Event Marketing Lead",
      event: "TechSummit 2024",
      avatar: "SC",
    },
    {
      quote: "We saved over $5,000 in marketing costs and reached 10x more people than traditional campaigns.",
      name: "Marcus Johnson",
      role: "Community Manager",
      event: "StartupWeek Berlin",
      avatar: "MJ",
    },
    {
      quote: "The analytics dashboard showed us exactly which visuals performed best. Game-changer for our strategy.",
      name: "Elena Rodriguez",
      role: "Brand Director",
      event: "Innovation Forum",
      avatar: "ER",
    },
  ];

  const successMetrics = [
    { icon: "📈", stat: "300%", label: "Average engagement increase" },
    { icon: "🔄", stat: "500+", label: "Shares in first week" },
    { icon: "⏱️", stat: "10 min", label: "Average setup time" },
  ];

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            What Event Organizers Are Saying
          </h2>
          <p className="text-lg text-muted-foreground">
            Real results from real events
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid gap-6 md:grid-cols-3 max-w-6xl mx-auto mb-12">
          {testimonials.map((testimonial, index) => (
            <Card
              key={index}
              className="p-6 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-300 animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <Quote className="h-8 w-8 text-primary mb-4 opacity-50" />
              <p className="text-muted-foreground mb-6 italic">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-sm">
                  {testimonial.avatar}
                </div>
                <div>
                  <div className="font-semibold text-foreground">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                  <div className="text-xs text-primary">{testimonial.event}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Success Metrics Bar */}
        <div className="border-t border-border/30 pt-8">
          <div className="flex flex-wrap justify-center gap-8 md:gap-16">
            {successMetrics.map((metric, index) => (
              <div
                key={index}
                className="text-center animate-fade-in"
                style={{ animationDelay: `${0.3 + index * 0.1}s` }}
              >
                <div className="mb-2 text-2xl">{metric.icon}</div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent mb-1">
                  {metric.stat}
                </div>
                <div className="text-sm text-muted-foreground">{metric.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
