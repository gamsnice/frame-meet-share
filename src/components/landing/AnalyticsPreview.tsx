import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Download, CalendarDays, Activity, Clock, Eye, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalyticsPreview() {
  const navigate = useNavigate();

  // Helper to avoid NaN / 0-height bars
  const getBarHeight = (value: number, max: number, minPercent = 8) => {
    if (!max || max <= 0) return minPercent;
    const ratio = (value / max) * 100;
    if (!Number.isFinite(ratio)) return minPercent;
    return Math.max(minPercent, ratio);
  };

  // Rich mock data: 7 days of activity (bigger & realistic)
  const dailyActivity = [
    { label: "Nov 23", views: 720, uploads: 130, downloads: 100 },
    { label: "Nov 24", views: 830, uploads: 140, downloads: 105 },
    { label: "Nov 25", views: 610, uploads: 120, downloads: 95 },
    { label: "Nov 26", views: 910, uploads: 150, downloads: 120 },
    { label: "Nov 27", views: 780, uploads: 130, downloads: 100 },
    { label: "Nov 28", views: 890, uploads: 150, downloads: 110 },
    { label: "Nov 29", views: 890, uploads: 140, downloads: 100 },
  ];

  const activityByDay = [
    { label: "Mon", total: 720 },
    { label: "Tue", total: 830 },
    { label: "Wed", total: 610 },
    { label: "Thu", total: 910 },
    { label: "Fri", total: 780 },
    { label: "Sat", total: 890 },
    { label: "Sun", total: 890 },
  ];

  const activityByHour = [
    { label: "08:00", total: 60 },
    { label: "09:00", total: 85 },
    { label: "10:00", total: 95 },
    { label: "11:00", total: 82 },
    { label: "12:00", total: 68 },
    { label: "13:00", total: 54 },
    { label: "14:00", total: 47 },
    { label: "15:00", total: 59 },
    { label: "16:00", total: 42 },
  ];

  const events = [
    {
      name: "Founders Summit Europe",
      subtitle: "Scale-up networking experience",
      range: "Mar 04 – Mar 06, 2026",
      slug: "/e/founders-summit-eu",
      views: 4230,
      conversion: "21.3%",
    },
    {
      name: "ProductCon Remote",
      subtitle: "Hybrid product launch series",
      range: "Apr 18 – Apr 20, 2026",
      slug: "/e/productcon-remote",
      views: 3185,
      conversion: "19.7%",
    },
    {
      name: "AI Leaders Day",
      subtitle: "Invite-only leadership meetup",
      range: "May 09, 2026",
      slug: "/e/ai-leaders-day",
      views: 1980,
      conversion: "24.1%",
    },
  ];

  // Totals derived from dailyActivity so cards & charts match
  const totalViews = dailyActivity.reduce((sum, d) => sum + d.views, 0); // 5,630
  const totalUploads = dailyActivity.reduce((sum, d) => sum + d.uploads, 0); // 960
  const totalDownloads = dailyActivity.reduce((sum, d) => sum + d.downloads, 0); // 730
  const conversionRate = (totalDownloads / totalViews) * 100; // ~12.9 -> 13%

  // Max values for scaling charts
  const maxDailyViews = dailyActivity.reduce((max, d) => Math.max(max, d.views), 0);
  const maxDayTotal = activityByDay.reduce((max, d) => Math.max(max, d.total), 0);
  const maxHourTotal = activityByHour.reduce((max, d) => Math.max(max, d.total), 0);

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
            A compact version of your analytics dashboard – so event organizers instantly see how much reach their
            content creates.
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
              <Card className="p-4 bg-background/60 border-border/70 hover:border-primary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Eye className="h-4 w-4 text-primary" />
                    <span>Total Views</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">+38% vs. last week</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-chart-uploads/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="h-4 w-4 text-chart-uploads" />
                    <span>Total Uploads</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-chart-uploads" />
                </div>
                <div className="text-2xl font-bold">{totalUploads.toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">140 participants created content</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-secondary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Download className="h-4 w-4 text-secondary" />
                    <span>Total Downloads</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
                <div className="text-[11px] text-muted-foreground">3 out of 4 uploads get reused</div>
              </Card>

              <Card className="p-4 bg-background/60 border-border/70 hover:border-primary/60 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <BarChart3 className="h-4 w-4 text-primary" />
                    <span>Conversion Rate</span>
                  </div>
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
                <div className="text-[11px] text-muted-foreground">Views → branded downloads</div>
              </Card>
            </div>

            {/* Charts grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Daily Activity Trend */}
              <Card className="p-4 bg-background/60 border-border/70">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="text-sm font-semibold">Daily Activity Trend</h4>
                    <p className="text-[11px] text-muted-foreground">Views, uploads & downloads over the last 7 days</p>
                  </div>
                </div>
                <div className="h-44 bg-background/40 rounded-lg border border-border/40 flex items-end justify-around p-4 gap-2">
                  {dailyActivity.map((day) => (
                    <div key={day.label} className="flex-1 flex flex-col items-center gap-1">
                      <div className="flex w-full gap-1 items-end">
                        {/* Views */}
                        <div
                          className="flex-1 rounded-t bg-primary/80"
                          style={{
                            height: `${getBarHeight(day.views, maxDailyViews)}%`,
                          }}
                        />
                        {/* Uploads */}
                        <div
                          className="w-1.5 rounded-t bg-chart-uploads/80"
                          style={{
                            height: `${getBarHeight(day.uploads, maxDailyViews)}%`,
                          }}
                        />
                        {/* Downloads */}
                        <div
                          className="w-1.5 rounded-t bg-secondary/80"
                          style={{
                            height: `${getBarHeight(day.downloads, maxDailyViews)}%`,
                          }}
                        />
                      </div>
                      <div className="text-[10px] text-muted-foreground">{day.label}</div>
                    </div>
                  ))}
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
                    {activityByDay.map((item) => (
                      <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-full rounded-t bg-primary/80"
                          style={{
                            height: `${getBarHeight(item.total, maxDayTotal)}%`,
                          }}
                        />
                        <div className="text-[10px] text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card className="p-4 bg-background/60 border-border/70">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-semibold">Activity by Hour of Day</h4>
                    <Clock className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-28 bg-background/40 rounded-lg border border-border/40 flex items-end justify-around p-3 gap-2">
                    {activityByHour.map((item) => (
                      <div key={item.label} className="flex-1 flex flex-col items-center gap-1">
                        <div
                          className="w-2 rounded-t bg-secondary/80"
                          style={{
                            height: `${getBarHeight(item.total, maxHourTotal)}%`,
                          }}
                        />
                        <div className="text-[10px] text-muted-foreground">{item.label}</div>
                      </div>
                    ))}
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

              <div className="grid gap-3 md:grid-cols-3">
                {events.map((event) => (
                  <Card key={event.slug} className="p-4 bg-background/60 border-border/70 flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="text-sm font-semibold">{event.name}</div>
                        <div className="text-[11px] text-muted-foreground">{event.subtitle}</div>
                      </div>
                    </div>

                    <div className="mt-1 text-[11px] text-muted-foreground flex items-center justify-between">
                      <span>{event.range}</span>
                      <span className="px-2 py-0.5 rounded-full bg-background/80 border border-border/60">
                        {event.slug}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-muted-foreground mt-2">
                      <div className="flex gap-3">
                        <span>{event.views.toLocaleString()} views</span>
                      </div>
                      <span className="text-primary font-semibold">{event.conversion} conv.</span>
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
                One glance shows organizers how much reach and reuse their event content creates.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.2s" }}>
              <div className="mb-2 text-secondary text-lg font-semibold">🎯 Smarter decisions</div>
              <p className="text-sm text-muted-foreground">
                See which templates perform best and use those learnings for the next event.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "0.3s" }}>
              <div className="mb-2 text-primary text-lg font-semibold">⏰ Peak engagement</div>
              <p className="text-sm text-muted-foreground">
                Identify your strongest days and hours to time announcements and social pushes perfectly.
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
