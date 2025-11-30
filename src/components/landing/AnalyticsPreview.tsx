import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Download, CalendarDays, Activity, Clock, Eye, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function AnalyticsPreview() {
  const navigate = useNavigate();

  // Rich mock data: 7 days of activity
  const dailyActivity = [{
    label: "Nov 23",
    views: 520,
    uploads: 80,
    downloads: 65
  }, {
    label: "Nov 24",
    views: 610,
    uploads: 90,
    downloads: 72
  }, {
    label: "Nov 25",
    views: 430,
    uploads: 70,
    downloads: 55
  }, {
    label: "Nov 26",
    views: 710,
    uploads: 120,
    downloads: 95
  }, {
    label: "Nov 27",
    views: 580,
    uploads: 85,
    downloads: 68
  }, {
    label: "Nov 28",
    views: 690,
    uploads: 110,
    downloads: 88
  }, {
    label: "Nov 29",
    views: 690,
    uploads: 105,
    downloads: 82
  }];
  const activityByDay = [{
    label: "Mon",
    total: 520
  }, {
    label: "Tue",
    total: 610
  }, {
    label: "Wed",
    total: 430
  }, {
    label: "Thu",
    total: 710
  }, {
    label: "Fri",
    total: 580
  }, {
    label: "Sat",
    total: 690
  }, {
    label: "Sun",
    total: 690
  }];
  const activityByHour = [{
    label: "08:00",
    total: 40
  }, {
    label: "09:00",
    total: 55
  }, {
    label: "10:00",
    total: 65
  }, {
    label: "11:00",
    total: 52
  }, {
    label: "12:00",
    total: 38
  }, {
    label: "13:00",
    total: 30
  }, {
    label: "14:00",
    total: 27
  }, {
    label: "15:00",
    total: 34
  }, {
    label: "16:00",
    total: 22
  }];
  const events = [{
    name: "Founders Summit Europe",
    subtitle: "Scale-up networking experience",
    range: "Mar 04 – Mar 06, 2026",
    slug: "/e/founders-summit-eu",
    views: 2310,
    conversion: "21.3%"
  }, {
    name: "ProductCon Remote",
    subtitle: "Hybrid product launch series",
    range: "Apr 18 – Apr 20, 2026",
    slug: "/e/productcon-remote",
    views: 1845,
    conversion: "19.7%"
  }, {
    name: "AI Leaders Day",
    subtitle: "Invite-only leadership meetup",
    range: "May 09, 2026",
    slug: "/e/ai-leaders-day",
    views: 980,
    conversion: "24.1%"
  }];

  // Max values for scaling charts
  const maxDailyViews = Math.max(...dailyActivity.map(d => d.views));
  const maxDayTotal = Math.max(...activityByDay.map(d => d.total));
  const maxHourTotal = Math.max(...activityByHour.map(d => d.total));

  // Use fixed pixel heights so bars always render visibly
  const MAX_DAILY_BAR_HEIGHT = 120;
  const MAX_SMALL_BAR_HEIGHT = 80;
  const MIN_BAR_HEIGHT = 12;
  const getDailyBarHeight = (value: number) => Math.max(value / maxDailyViews * MAX_DAILY_BAR_HEIGHT, MIN_BAR_HEIGHT);
  const getDayBarHeight = (value: number) => Math.max(value / maxDayTotal * MAX_SMALL_BAR_HEIGHT, MIN_BAR_HEIGHT);
  const getHourBarHeight = (value: number) => Math.max(value / maxHourTotal * MAX_SMALL_BAR_HEIGHT, MIN_BAR_HEIGHT);
  return <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Your Event&apos;s <span className="bg-gradient-accent bg-clip-text text-transparent">Impact</span> in Real
            Time
          </h2>
          
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
                <div className="text-2xl font-bold">5,630</div>
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
                <div className="text-2xl font-bold">960</div>
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
                <div className="text-2xl font-bold">730</div>
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
                <div className="text-2xl font-bold">13.0%</div>
                <div className="text-[11px] text-muted-foreground">Views → branded downloads</div>
              </Card>
            </div>

            {/* Charts grid */}
            <div className="grid gap-6 md:grid-cols-2 mb-6">
              {/* Daily Activity Trend */}

              {/* Activity by Day + Hour */}
              <div className="space-y-4">
                {/* By day */}

                {/* By hour */}
              </div>
            </div>

            {/* Your Events preview */}
            <div className="mt-4">
              <div className="grid gap-3 md:grid-cols-3">{events.map(event => null)}</div>
            </div>
          </Card>

          {/* Key Features + CTA */}
          <div className="grid gap-6 md:grid-cols-3 mt-4">
            <div className="text-center animate-fade-in" style={{
            animationDelay: "0.1s"
          }}>
              <div className="mb-2 text-primary text-lg font-semibold">📊 Live overview</div>
              <p className="text-sm text-muted-foreground">
                One glance shows organizers how much reach and reuse their event content creates.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{
            animationDelay: "0.2s"
          }}>
              <div className="mb-2 text-secondary text-lg font-semibold">🎯 Smarter decisions</div>
              <p className="text-sm text-muted-foreground">
                See which templates perform best and use those learnings for the next event.
              </p>
            </div>
            <div className="text-center animate-fade-in" style={{
            animationDelay: "0.3s"
          }}>
              <div className="mb-2 text-primary text-lg font-semibold">⏰ Peak engagement</div>
              <p className="text-sm text-muted-foreground">
                Identify your strongest days and hours to time announcements and social pushes perfectly.
              </p>
            </div>
          </div>

          <div className="text-center mt-4 animate-fade-in" style={{
          animationDelay: "0.4s"
        }}>
            <Button size="lg" className="bg-gradient-accent text-primary-foreground hover:opacity-90 shadow-glow" onClick={() => navigate("/admin/register")}>
              Get These Insights for Your Event
            </Button>
          </div>
        </div>
      </div>
    </section>;
}