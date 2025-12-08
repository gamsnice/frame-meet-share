import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, Copy, ExternalLink, TrendingUp } from "lucide-react";
import { toast } from "sonner";
import { subDays } from "date-fns";
import DateRangePicker from "./analytics/DateRangePicker";
import EventFilter from "./analytics/EventFilter";
import StatsCards from "./analytics/StatsCards";
import DailyTrendChart from "./analytics/DailyTrendChart";
import HourlyHeatmap from "./analytics/HourlyHeatmap";
import WeekdayChart from "./analytics/WeekdayChart";
import ResetStatsDialog from "./analytics/ResetStatsDialog";
import { useAnalyticsData } from "@/hooks/useAnalyticsData";
import type { EventBase } from "@/types";

export default function DashboardHome({ userId }: { userId: string }) {
  const [events, setEvents] = useState<EventBase[]>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(subDays(new Date(), 30));
  const [endDate, setEndDate] = useState<Date | undefined>(new Date());
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const navigate = useNavigate();
  
  const { dailyData, hourlyData, weekdayData, stats, loadAnalytics } = useAnalyticsData();

  useEffect(() => {
    loadEvents();
  }, [userId]);

  useEffect(() => {
    if (events.length > 0) {
      const eventIds = selectedEventId ? [selectedEventId] : events.map((e) => e.id);
      loadAnalytics(eventIds, startDate, endDate);
    }
  }, [events, startDate, endDate, selectedEventId, loadAnalytics]);

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
      setEventsLoading(false);
    }
  };

  const handleRefreshAnalytics = () => {
    const eventIds = selectedEventId ? [selectedEventId] : events.map((e) => e.id);
    loadAnalytics(eventIds, startDate, endDate);
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied to clipboard!");
  };

  if (eventsLoading) {
    return <div className="text-center py-12">Loading dashboard...</div>;
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-start">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground text-sm sm:text-base">Track performance across all your events</p>
        </div>
        <Button onClick={() => navigate("/admin/events/new")} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center w-full">
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
          onSuccess={handleRefreshAnalytics}
        />
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      {dailyData.length > 0 && (
        <>
          <DailyTrendChart data={dailyData} />
          <div className="grid gap-6 md:grid-cols-2 overflow-hidden">
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
                  <code className="text-sm flex-1 truncate">/{event.slug}</code>
                  <Button size="sm" variant="ghost" onClick={() => copyEventLink(event.slug)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => window.open(`/${event.slug}`, "_blank")}>
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
