import { useEffect, useState } from "react";
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

  const [active, setActive] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-rotation every 3s, pauses on hover
  useEffect(() => {
    if (isHovered || testimonials.length <= 1) return;

    const interval = setInterval(() => {
      setActive((prev) => (prev + 1) % testimonials.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [isHovered, testimonials.length]);

  const next = () => setActive((prev) => (prev + 1) % testimonials.length);
  const prev = () => setActive((prev) => (prev - 1 + testimonials.length) % testimonials.length);

  // Touch handlers for mobile swipe (kept simple to avoid TS noise)
  const handleTouchStart = (e: any) => {
    setTouchStartX(e.touches[0].clientX);
    setIsHovered(true); // pause while swiping
  };

  const handleTouchEnd = (e: any) => {
    if (touchStartX === null) {
      setIsHovered(false);
      return;
    }

    const deltaX = e.changedTouches[0].clientX - touchStartX;

    if (Math.abs(deltaX) > 50) {
      if (deltaX < 0) {
        // swipe left → next
        next();
      } else {
        // swipe right → prev
        prev();
      }
    }

    setTouchStartX(null);
    setIsHovered(false);
  };

  const current = testimonials[active];

  return (
    <section className="py-20 bg-gradient-card relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        {/* Heading */}
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">What Event Organizers Are Saying</h2>
          <p className="text-lg text-muted-foreground">Real results from real events</p>
        </div>

        {/* Slider */}
        <div
          className="relative max-w-4xl mx-auto mb-12"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <Card
            key={active}
            className={`
              p-8 md:p-10 bg-background/70 backdrop-blur-lg border-border/60 
              shadow-lg shadow-primary/10 
              transition-all duration-700 
              animate-fade-slide
              rounded-3xl
            `}
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center">
              {/* Left: quote content */}
              <div className="flex-1 space-y-4">
                <Quote className="h-10 w-10 text-primary opacity-70" />
                <p className="text-muted-foreground italic text-lg md:text-xl leading-relaxed">“{current.quote}”</p>
              </div>

              {/* Right: bigger avatar + meta */}
              <div className="flex items-center gap-4 md:min-w-[260px]">
                <div className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-lg shadow-[0_0_30px_rgba(0,0,0,0.35)]">
                  {current.avatar}
                </div>
                <div className="space-y-1">
                  <div className="font-semibold text-foreground text-base md:text-lg">{current.name}</div>
                  <div className="text-sm text-muted-foreground">{current.role}</div>
                  <div className="text-xs font-semibold text-primary uppercase tracking-wide">{current.event}</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Arrows */}
          <button
            type="button"
            onClick={prev}
            className="absolute -left-5 md:-left-7 top-1/2 -translate-y-1/2 bg-primary/15 hover:bg-primary/30 text-primary rounded-full h-10 w-10 flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            ‹
          </button>
          <button
            type="button"
            onClick={next}
            className="absolute -right-5 md:-right-7 top-1/2 -translate-y-1/2 bg-primary/15 hover:bg-primary/30 text-primary rounded-full h-10 w-10 flex items-center justify-center backdrop-blur-sm transition-colors"
          >
            ›
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-6">
            {testimonials.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                className={`h-2.5 rounded-full transition-all ${
                  i === active ? "bg-primary w-7" : "bg-primary/30 hover:bg-primary/50 w-2.5"
                }`}
              />
            ))}
          </div>
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
