import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Download, CalendarDays, Activity, Clock, Eye, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalyticsPreview() {
  const navigate = useNavigate();

  // Mock data roughly matching your real dashboard
  const dailyActivity = [
    { label: "Nov 26", views: 28, uploads: 1, downloads: 1 },
    { label: "Nov 27", views: 7, uploads: 2, downloads: 1 },
    { label: "Nov 28", views: 1, uploads: 1, downloads: 1 },
    { label: "Nov 29", views: 4, uploads: 3, downloads: 2 },
  ];

  const activityByDay = [
    { label: "Wed", total: 28 },
    { label: "Thu", total: 7 },
    { label: "Fri", total: 7 },
    { label: "Sat", total: 9 },
  ];

  const activityByHour = [
    { label: "08:00", total: 5 },
    { label: "09:00", total: 3 },
    { label: "10:00", total: 4 },
    { label: "11:00", total: 2 },
    { label: "12:00", total: 1 },
  ];

  const events = [
    {
      name: "SKI26",
      subtitle: "Pilot event",
      range: "Nov 26 – Nov 29, 2025",
      slug: "/e/ski26",
      views: 40,
      conversion: "17.5%",
    },
    {
      name: "Skinnovation 2026",
      subtitle: "Main conference",
      range: "Dec 12 – Dec 14, 2026",
      slug: "/e/skinnovation",
      views: 73,
      conversion: "22.1%",
    },
  ];

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            See Your Event&apos;s <span className="bg-gradient-accent bg-clip-text text-transparent">Impact</span> in
            Real Time
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A compact version of your analytics dashboard – so you can show organizers exactly how every frame, upload
            and download performs.
          </p>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Analytics Dashboard Mockup */}
          <Card className="p-6 md:p-8 bg-gradient-card border-border/60 shadow-glow animate-scale-in rounded-3xl">
            {/* Header row */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg md:text-xl font-semibold">Analytics Dashboard</h3>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Track performance across all your events – live.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/60">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <span>Nov 01, 2025 – Nov 30, 2025</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-background/60 border border-border/60">
                  <Activity className="h-4 w-4 text-muted-foreground" />
                  <span>All events</span>
                </div>
              </div>
            </div>

            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className="p-4 bg-background/60 border-border/70 hover:border-primary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Total Views</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">40</div>
                <div className="text-[11px] text-muted-foreground">+28 vs. last week</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-chart-uploads/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4 text-chart-uploads" />
                    <span>Total Uploads</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-chart-uploads" />
                </div>
                <div className="text-2xl font-bold">10</div>
                <div className="text-[11px] text-muted-foreground">6 unique participants</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-secondary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Download className="h-4 w-4 text-secondary" />
                    <span>Total Downloads</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div className="text-2xl font-bold">7</div>
                <div className="text-[11px] text-muted-foreground">70% of uploads get reused</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-primary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Conversion Rate</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">17.5%</div>
                <div className="text-[11px] text-muted-foreground">From views → branded downloads</div>
              </Card>
            </div>

            {/* Charts grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Daily Activity Trend */}
              <Card className="p-4 bg-background/60 border-border/70">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold">Daily Activity Trend</h4>
                    <p className="text-[11px] text-muted-foreground">Views, uploads & downloads over time</p>
                  </div>
                </div>
                <div className="h-44 bg-background/40 rounded-lg border border-border/40 flex items-end justify-around p-4 gap-2">
                  {dailyActivity.map((day, index) => {
                    const max = 28; // max views for scaling
                    return (
                      <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                        <div className="flex w-full gap-1 items-end">
                          {/* Views */}
                          <div
                            className="flex-1 rounded-t bg-primary/70"
                            style={{ height: `${(day.views / max) * 100}%` }}
                          />
                          {/* Uploads */}
                          <div
                            className="w-1.5 rounded-t bg-chart-uploads/80"
                            style={{
                              height: `${(day.uploads / max) * 100 + 10}%`,
                            }}
                          />
                          {/* Downloads */}
                          <div
                            className="w-1.5 rounded-t bg-secondary/80"
                            style={{
                              height: `${(day.downloads / max) * 100 + 10}%`,
                            }}
                          />
                        </div>
                        <div className="text-[10px] text-muted-foreground">{day.label}</div>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex items-center gap-4 text-[10px] text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-primary/80" />
                    Views
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-chart-uploads/80" />
                    Uploads
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-secondary/80" />
                    Downloads
                  </div>
                </div>
              </Card>

              {/* Activity by Day + Hour */}
              <div className="space-y-4">
                <Card className="p-4 bg-background/60 border-border/70">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Activity by Day of Week</h4>
                    <Activity className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-28 bg-background/40 rounded-lg border border-border/40 flex items-end justify-around p-3 gap-2">
                    {activityByDay.map((item) => {
                      const max = 28;
                      return (
                        <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-full rounded-t bg-primary/80"
                            style={{ height: `${(item.total / max) * 100}%` }}
                          />
                          <div className="text-[10px] text-muted-foreground">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>

                <Card className="p-4 bg-background/60 border-border/70">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Activity by Hour of Day</h4>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-28 bg-background/40 rounded-lg border border-border/40 flex items-end justify-around p-3 gap-2">
                    {activityByHour.map((item) => {
                      const max = 8;
                      return (
                        <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                          <div
                            className="w-2 rounded-t bg-secondary/80"
                            style={{ height: `${(item.total / max) * 100}%` }}
                          />
                          <div className="text-[10px] text-muted-foreground">{item.label}</div>
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            </div>

            {/* Your Events preview */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-semibold">Your Events</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-xs gap-1"
                  onClick={() => navigate("/admin/events")}
                >
                  View all
                  <ArrowUpRight className="h-3 w-3" />
                </Button>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                {events.map((event) => (
                  <Card key={event.slug} className="p-4 bg-background/60 border-border/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{event.name}</div>
                        <div className="text-[11px] text-muted-foreground">{event.subtitle}</div>
                      </div>
                      <span className="text-[11px] px-2 py-1 rounded-full bg-background/80 border border-border/60">
                        {event.range}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                      <span>{event.slug}</span>
                      <div className="flex gap-3">
                        <span>{event.views} views</span>
                        <span className="text-primary font-semibold">{event.conversion} conv.</span>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </Card>

          {/* Key Features + CTA */}
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.1s" }}>
              <div className="mb-2 text-primary text-lg font-semibold">📊 Live overview</div>
              <p className="text-sm text-muted-foreground">
                One glance shows you how your event content performs across all channels.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="mb-2 text-secondary text-lg font-semibold">🎯 Smarter decisions</div>
              <p className="text-sm text-muted-foreground">
                See which frames and formats convert best, and double down on what works.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="mb-2 text-primary text-lg font-semibold">⏰ Peak engagement</div>
              <p className="text-sm text-muted-foreground">
                Identify your strongest days and hours to time campaigns perfectly.
              </p>
            </div>
          </div>

          <div className="text-center mt-10 animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <Button
              size="lg"
              className="bg-gradient-accent text-primary-foreground hover:opacity-90 shadow-glow"
              onClick={() => navigate("/admin/register")}
            >
              Get These Insights for Your Event
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
