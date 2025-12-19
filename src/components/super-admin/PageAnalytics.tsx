import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, TrendingUp, Globe, Clock } from "lucide-react";
import { format, subDays, startOfDay, endOfDay } from "date-fns";

interface PageView {
  id: string;
  created_at: string;
  page_path: string;
  referrer: string | null;
  user_agent: string | null;
}

interface DailyStats {
  date: string;
  count: number;
}

export default function PageAnalytics() {
  const [pageViews, setPageViews] = useState<PageView[]>([]);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [totalViews, setTotalViews] = useState(0);
  const [todayViews, setTodayViews] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPageViews();
  }, []);

  const fetchPageViews = async () => {
    try {
      // Fetch all page views (type assertion until types regenerate)
      const { data, error } = await (supabase as any)
        .from("page_views")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100);

      if (error) throw error;

      const views = data || [];
      setPageViews(views);
      setTotalViews(views.length);

      // Calculate today's views
      const today = startOfDay(new Date());
      const todayCount = views.filter(
        (v: PageView) => new Date(v.created_at) >= today
      ).length;
      setTodayViews(todayCount);

      // Calculate daily stats for last 7 days
      const stats: DailyStats[] = [];
      for (let i = 6; i >= 0; i--) {
        const date = subDays(new Date(), i);
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);
        const count = views.filter((v: PageView) => {
          const viewDate = new Date(v.created_at);
          return viewDate >= dayStart && viewDate <= dayEnd;
        }).length;
        stats.push({
          date: format(date, "MMM d"),
          count,
        });
      }
      setDailyStats(stats);
    } catch (error) {
      console.error("Error fetching page views:", error);
    } finally {
      setLoading(false);
    }
  };

  const getDeviceFromUserAgent = (ua: string | null): string => {
    if (!ua) return "Unknown";
    if (/mobile/i.test(ua)) return "Mobile";
    if (/tablet/i.test(ua)) return "Tablet";
    return "Desktop";
  };

  const getReferrerDomain = (referrer: string | null): string => {
    if (!referrer) return "Direct";
    try {
      const url = new URL(referrer);
      return url.hostname;
    } catch {
      return referrer;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
      </div>
    );
  }

  // Calculate max for bar chart
  const maxCount = Math.max(...dailyStats.map((s) => s.count), 1);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Page Analytics</h2>
        <p className="text-muted-foreground">Landing page view statistics</p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Views</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayViews}</div>
            <p className="text-xs text-muted-foreground">Since midnight</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Daily</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {dailyStats.length > 0
                ? Math.round(
                    dailyStats.reduce((sum, s) => sum + s.count, 0) /
                      dailyStats.length
                  )
                : 0}
            </div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>
      </div>

      {/* Simple Bar Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Views Last 7 Days</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between gap-2 h-32">
            {dailyStats.map((stat) => (
              <div
                key={stat.date}
                className="flex flex-col items-center flex-1"
              >
                <div
                  className="w-full bg-primary rounded-t transition-all"
                  style={{
                    height: `${(stat.count / maxCount) * 100}%`,
                    minHeight: stat.count > 0 ? "4px" : "0",
                  }}
                />
                <span className="text-xs text-muted-foreground mt-2">
                  {stat.date}
                </span>
                <span className="text-xs font-medium">{stat.count}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Views Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Page Views</CardTitle>
          <CardDescription>Last 100 visitors</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-2">Time</th>
                  <th className="text-left py-2 px-2">Page</th>
                  <th className="text-left py-2 px-2">Referrer</th>
                  <th className="text-left py-2 px-2">Device</th>
                </tr>
              </thead>
              <tbody>
                {pageViews.slice(0, 20).map((view) => (
                  <tr key={view.id} className="border-b last:border-0">
                    <td className="py-2 px-2 text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(view.created_at), "MMM d, HH:mm")}
                      </div>
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="outline">{view.page_path}</Badge>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">
                      {getReferrerDomain(view.referrer)}
                    </td>
                    <td className="py-2 px-2">
                      <Badge variant="secondary">
                        {getDeviceFromUserAgent(view.user_agent)}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {pageViews.length === 0 && (
              <p className="text-center text-muted-foreground py-8">
                No page views recorded yet.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
