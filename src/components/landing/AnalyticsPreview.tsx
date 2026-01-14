import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Download, CalendarDays, Activity, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

export default function AnalyticsPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-28 bg-muted/15 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <ScrollReveal animation="fade-up" duration={600}>
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              Your Event&apos;s <span className="bg-gradient-accent bg-clip-text text-transparent">Impact</span> in Real
              Time
            </h2>
          </div>
        </ScrollReveal>

        <div className="max-w-6xl mx-auto">
          {/* Analytics Dashboard Mockup */}
          <ScrollReveal animation="zoom-in" duration={800}>
            <Card className="p-6 md:p-8 bg-card/80 backdrop-blur-sm border-border/60 shadow-glow rounded-3xl">
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
                <div>
                  <h3 className="text-lg md:text-xl font-semibold">Analytics Dashboard</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Track performance across all your events – live.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/60">
                    <CalendarDays className="h-4 w-4 text-muted-foreground" />
                    <span>Nov 23 – Nov 29, 2025</span>
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/60">
                    <Activity className="h-4 w-4 text-muted-foreground" />
                    <span>All events</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Row */}
              <div className="grid gap-4 md:grid-cols-4 mb-8">
                {[
                  { icon: Eye, label: "Total Views", value: "5,630", change: "+38% vs. last week", color: "primary" },
                  { icon: Users, label: "Total Uploads", value: "960", change: "140 participants created content", color: "chart-uploads" },
                  { icon: Download, label: "Total Downloads", value: "730", change: "3 out of 4 uploads get reused", color: "secondary" },
                  { icon: BarChart3, label: "Conversion Rate", value: "13.0%", change: "Views → branded downloads", color: "primary" },
                ].map((metric, index) => {
                  const Icon = metric.icon;
                  return (
                    <ScrollReveal key={metric.label} animation="fade-up" delay={100 + index * 100} duration={600}>
                      <Card className={`p-4 bg-background/60 border-border/70 hover:border-${metric.color}/60 transition-colors`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Icon className={`h-4 w-4 text-${metric.color}`} />
                            <span>{metric.label}</span>
                          </div>
                          <TrendingUp className={`h-4 w-4 text-${metric.color}`} />
                        </div>
                        <div className="text-2xl font-bold">{metric.value}</div>
                        <div className="text-[11px] text-muted-foreground">{metric.change}</div>
                      </Card>
                    </ScrollReveal>
                  );
                })}
              </div>

              {/* Charts grid placeholder */}
              <div className="grid gap-6 md:grid-cols-2 mb-6">
                <div className="space-y-4" />
                <div className="space-y-4" />
              </div>

              {/* Events preview placeholder */}
              <div className="mt-4">
                <div className="grid gap-3 md:grid-cols-3" />
              </div>
            </Card>
          </ScrollReveal>

          {/* Key Features + CTA */}
          <div className="grid gap-8 md:grid-cols-3 mt-10">
            {[
              { emoji: "📊", title: "Live overview", description: "One glance shows organizers how much reach and reuse their event content creates.", color: "primary" },
              { emoji: "🎯", title: "Smarter decisions", description: "See which templates perform best and use those learnings for the next event.", color: "secondary" },
              { emoji: "⏰", title: "Peak engagement", description: "Identify your strongest days and hours to time announcements and social pushes perfectly.", color: "primary" },
            ].map((feature, index) => (
              <ScrollReveal key={feature.title} animation="fade-up" delay={200 + index * 100} duration={600}>
                <div className="text-center">
                  <div className={`mb-2 text-${feature.color} text-lg font-semibold`}>
                    {feature.emoji} {feature.title}
                  </div>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal animation="fade-up" delay={500} duration={600}>
            <div className="text-center mt-10">
              <Button
                size="lg"
                className="bg-gradient-accent text-primary-foreground hover:opacity-90 shadow-glow"
                onClick={() => navigate("/admin/register")}
              >
                Get These Insights for Your Event
              </Button>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
