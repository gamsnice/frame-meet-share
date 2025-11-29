import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, TrendingUp, Users, Download } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function AnalyticsPreview() {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAyIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="mb-12 text-center animate-fade-in">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            See Your Event's <span className="bg-gradient-accent bg-clip-text text-transparent">Impact</span> in Real-Time
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Know exactly what's working with powerful analytics that track every view, upload, download, and share
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          {/* Analytics Dashboard Mockup */}
          <Card className="p-8 bg-gradient-card border-border/50 shadow-glow animate-scale-in" style={{ animationDelay: "0.2s" }}>
            {/* Key Metrics Row */}
            <div className="grid gap-4 md:grid-cols-4 mb-8">
              <Card className="p-4 bg-background/50 border-primary/30 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Users className="h-5 w-5 text-primary" />
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary animate-pulse">2,847</div>
                <div className="text-xs text-muted-foreground">Total Views</div>
              </Card>

              <Card className="p-4 bg-background/50 border-chart-uploads/30 hover:border-chart-uploads/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-chart-uploads" />
                  <TrendingUp className="h-4 w-4 text-chart-uploads" />
                </div>
                <div className="text-2xl font-bold text-chart-uploads animate-pulse" style={{ animationDelay: "0.2s" }}>1,243</div>
                <div className="text-xs text-muted-foreground">Photo Uploads</div>
              </Card>

              <Card className="p-4 bg-background/50 border-secondary/30 hover:border-secondary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <Download className="h-5 w-5 text-secondary" />
                  <TrendingUp className="h-4 w-4 text-secondary" />
                </div>
                <div className="text-2xl font-bold text-secondary animate-pulse" style={{ animationDelay: "0.4s" }}>1,098</div>
                <div className="text-xs text-muted-foreground">Downloads</div>
              </Card>

              <Card className="p-4 bg-background/50 border-primary/30 hover:border-primary/50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <BarChart3 className="h-5 w-5 text-primary" />
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                <div className="text-2xl font-bold text-primary animate-pulse" style={{ animationDelay: "0.6s" }}>88%</div>
                <div className="text-xs text-muted-foreground">Conversion Rate</div>
              </Card>
            </div>

            {/* Chart Visualization Mockup */}
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Daily Trend</h4>
              <div className="h-48 bg-background/30 rounded-lg border border-border/30 flex items-end justify-around p-4 gap-2">
                {[40, 65, 45, 80, 70, 90, 85].map((height, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-gradient-accent rounded-t animate-scale-in opacity-80 hover:opacity-100 transition-opacity"
                      style={{
                        height: `${height}%`,
                        animationDelay: `${0.8 + index * 0.1}s`
                      }}
                    ></div>
                    <div className="text-xs text-muted-foreground">D{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Template Performance Preview */}
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-4">Template Performance</h4>
              <div className="space-y-3">
                {[
                  { name: "Startup Template", views: 892, downloads: 745, color: "primary" },
                  { name: "Speaker Frame", views: 654, downloads: 523, color: "secondary" },
                  { name: "Investor Badge", views: 432, downloads: 389, color: "primary" }
                ].map((template, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-background/30 rounded-lg border border-border/30 hover:border-primary/30 transition-colors animate-fade-in"
                    style={{ animationDelay: `${1.5 + index * 0.1}s` }}
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-foreground mb-1">{template.name}</div>
                      <div className="flex gap-4 text-xs text-muted-foreground">
                        <span>{template.views} views</span>
                        <span>{template.downloads} downloads</span>
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {Math.round((template.downloads / template.views) * 100)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Key Features List */}
          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <div className="text-center animate-fade-in" style={{ animationDelay: "1.8s" }}>
              <div className="mb-2 text-primary text-lg font-semibold">📊 Track Everything</div>
              <p className="text-sm text-muted-foreground">Views, uploads, downloads, and shares—all in real-time</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "1.9s" }}>
              <div className="mb-2 text-secondary text-lg font-semibold">🎯 Template Insights</div>
              <p className="text-sm text-muted-foreground">See which templates perform best and optimize your strategy</p>
            </div>
            <div className="text-center animate-fade-in" style={{ animationDelay: "2s" }}>
              <div className="mb-2 text-primary text-lg font-semibold">⏰ Peak Times</div>
              <p className="text-sm text-muted-foreground">Identify when your audience is most engaged</p>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center mt-12 animate-fade-in" style={{ animationDelay: "2.1s" }}>
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
