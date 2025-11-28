import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Copy, ExternalLink, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { subDays, format, getDay, parseISO } from "date-fns";
import DateRangePicker from "./analytics/DateRangePicker";
import EventFilter from "./analytics/EventFilter";
import StatsCards from "./analytics/StatsCards";
import DailyTrendChart from "./analytics/DailyTrendChart";
import HourlyHeatmap from "./analytics/HourlyHeatmap";
import WeekdayChart from "./analytics/WeekdayChart";
import ResetStatsDialog from "./analytics/ResetStatsDialog";

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface DailyData {
  date: string;
  views: number;
  uploads: number;
  downloads: number;
}

interface HourlyData {
  hour: number;
  views: number;
  uploads: number;
  downloads: number;
}

interface WeekdayData {
  day: string;
  views: number;
  uploads: number;
  downloads: number;
}

export default function DashboardHome({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [stats, setStats] = useState({ totalViews: 0, totalUploads: 0, totalDownloads: 0, conversionRate: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    loadEvents();
  }, [userId]);

  useEffect(() => {
    if (events.length > 0) {
      loadAnalytics();
    }
  }, [events, startDate, endDate, selectedEventId]);

  const loadEvents = async () => {
    try {
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);
    } catch (error: any) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    try {
      const eventIds = selectedEventId ? [selectedEventId] : events.map((e) => e.id);
      
      if (eventIds.length === 0) return;

      // Build date filter
      let dailyQuery = supabase.from("event_stats_daily").select("*").in("event_id", eventIds);
      if (startDate) dailyQuery = dailyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) dailyQuery = dailyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: dailyStats } = await dailyQuery;

      // Build hourly query
      let hourlyQuery = supabase.from("event_stats_hourly").select("*").in("event_id", eventIds);
      if (startDate) hourlyQuery = hourlyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) hourlyQuery = hourlyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: hourlyStats } = await hourlyQuery;

      // Calculate overall stats
      if (dailyStats) {
        const totalViews = dailyStats.reduce((sum, s) => sum + (s.views_count || 0), 0);
        const totalUploads = dailyStats.reduce((sum, s) => sum + (s.uploads_count || 0), 0);
        const totalDownloads = dailyStats.reduce((sum, s) => sum + (s.downloads_count || 0), 0);
        const conversionRate = totalViews > 0 ? (totalDownloads / totalViews) * 100 : 0;
        
        setStats({ totalViews, totalUploads, totalDownloads, conversionRate });

        // Process daily trend data
        const dailyMap = new Map<string, DailyData>();
        dailyStats.forEach((stat) => {
          const dateStr = stat.date;
          const existing = dailyMap.get(dateStr) || { date: dateStr, views: 0, uploads: 0, downloads: 0 };
          dailyMap.set(dateStr, {
            date: dateStr,
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        setDailyData(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

        // Process weekday data
        const weekdayMap = new Map<number, WeekdayData>();
        const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
        dailyStats.forEach((stat) => {
          const dayOfWeek = getDay(parseISO(stat.date));
          const existing = weekdayMap.get(dayOfWeek) || { day: dayNames[dayOfWeek], views: 0, uploads: 0, downloads: 0 };
          weekdayMap.set(dayOfWeek, {
            day: dayNames[dayOfWeek],
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        const sortedWeekdays = Array.from(weekdayMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([, data]) => data);
        setWeekdayData(sortedWeekdays);
      }

      // Process hourly data
      if (hourlyStats) {
        const hourlyMap = new Map<number, HourlyData>();
        for (let i = 0; i < 24; i++) {
          hourlyMap.set(i, { hour: i, views: 0, uploads: 0, downloads: 0 });
        }
        hourlyStats.forEach((stat) => {
          const existing = hourlyMap.get(stat.hour)!;
          hourlyMap.set(stat.hour, {
            hour: stat.hour,
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        setHourlyData(Array.from(hourlyMap.values()));
      }
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
    }
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard!");
  };

  if (loading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Track performance across all your events</p>
        </div>
        <Button onClick={() => navigate("/admin/events/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
        <EventFilter
          events={events}
          selectedEventId={selectedEventId}
          onEventChange={setSelectedEventId}
        />
        <ResetStatsDialog
          eventId={selectedEventId || undefined}
          startDate={startDate}
          endDate={endDate}
          onSuccess={loadAnalytics}
        />
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      {dailyData.length > 0 && (
        <>
          <DailyTrendChart data={dailyData} />
          <div className="grid gap-6 md:grid-cols-2">
            <WeekdayChart data={weekdayData} />
            <HourlyHeatmap data={hourlyData} />
          </div>
        </>
      )}

      {/* Top Events */}
      <Card className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Your Events</h2>
          <Button variant="outline" onClick={() => navigate("/admin/events")}>
            View All
          </Button>
        </div>

        {events.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">Create your first event to get started</p>
            <Button onClick={() => navigate("/admin/events/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.slice(0, 4).map((event) => (
              <Card key={event.id} className="p-6 hover:shadow-hover transition-shadow">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{event.name}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2">{event.description}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mb-4">
                  <code className="text-sm flex-1 truncate">/e/{event.slug}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyEventLink(event.slug)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/e/${event.slug}`, "_blank")}>
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => navigate(`/admin/events/${event.id}/edit`)}>
                    Edit Event
                  </Button>
                  <Button size="sm" className="flex-1" onClick={() => navigate(`/admin/events/${event.id}/analytics`)}>
                    <TrendingUp className="mr-2 h-4 w-4" />
                    Analytics
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
