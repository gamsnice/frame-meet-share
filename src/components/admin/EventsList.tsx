import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Copy, ExternalLink, Pencil, BarChart3, Eye, Download } from "lucide-react";
import { toast } from "sonner";
import { EventBase } from "@/types";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import UpgradePromptDialog from "./UpgradePromptDialog";

interface EventStats {
  views: number;
  downloads: number;
}

export default function EventsList({ userId }: { userId: string }) {
  const [events, setEvents] = useState<EventBase[]>([]);
  const [eventStats, setEventStats] = useState<Map<string, EventStats>>(new Map());
  const [loading, setLoading] = useState(true);
  const [showUpgradeDialog, setShowUpgradeDialog] = useState(false);
  const navigate = useNavigate();
  const { subscription, canCreateEvent, eventsRemaining } = useSubscriptionLimits(userId);

  useEffect(() => {
    loadEvents();
  }, [userId]);

  const loadEvents = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setEvents(data || []);

      // Load all-time stats for each event
      if (data && data.length > 0) {
        const eventIds = data.map((e) => e.id);

        const { data: statsData } = await supabase
          .from("event_stats_daily")
          .select("event_id, views_count, downloads_count")
          .in("event_id", eventIds)
          .is("template_id", null);

        if (statsData) {
          const statsMap = new Map<string, EventStats>();
          statsData.forEach((stat) => {
            const existing = statsMap.get(stat.event_id) || { views: 0, downloads: 0 };
            statsMap.set(stat.event_id, {
              views: existing.views + (stat.views_count || 0),
              downloads: existing.downloads + (stat.downloads_count || 0),
            });
          });
          setEventStats(statsMap);
        }
      }
    } catch (error: any) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied!");
  };

  const handleCreateEvent = () => {
    if (!canCreateEvent) {
      setShowUpgradeDialog(true);
      return;
    }
    navigate("/admin/events/new");
  };

  if (loading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in overflow-hidden max-w-full">
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Manage your event visuals pages</p>
        </div>
        <Button onClick={handleCreateEvent} size="lg" className="w-full sm:w-auto">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
          {eventsRemaining !== null && eventsRemaining <= 2 && (
            <span className="ml-2 text-xs opacity-75">({eventsRemaining} left)</span>
          )}
        </Button>
      </div>

      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No events yet</h3>
          <p className="text-muted-foreground mb-6">Create your first event visuals page to get started</p>
          <Button onClick={handleCreateEvent}>
            <Plus className="mr-2 h-4 w-4" />
            Create Your First Event
          </Button>
        </Card>
      ) : (
        <div className="grid gap-6 max-w-full overflow-hidden">
          {events.map((event) => {
            const stats = eventStats.get(event.id) || { views: 0, downloads: 0 };
            return (
              <Card key={event.id} className="p-4 sm:p-6 overflow-hidden max-w-full">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-xl">{event.name}</h3>
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="gap-1">
                          <Eye className="h-3 w-3" />
                          {stats.views}
                        </Badge>
                        <Badge variant="secondary" className="gap-1">
                          <Download className="h-3 w-3" />
                          {stats.downloads}
                        </Badge>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-3">{event.description}</p>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {event.location && <span>📍 {event.location}</span>}
                    </div>

                    <div className="flex items-center gap-2 p-2 sm:p-3 bg-muted rounded-lg mt-4 w-full lg:max-w-md overflow-hidden">
                      <code className="text-xs sm:text-sm flex-1 truncate">{window.location.origin}/{event.slug}</code>
                      <Button size="sm" variant="ghost" onClick={() => copyEventLink(event.slug)}>
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => window.open(`/${event.slug}`, "_blank")}>
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 lg:min-w-[200px]">
                    <Button variant="outline" onClick={() => navigate(`/admin/events/${event.id}/edit`)} className="justify-start">
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit Event
                    </Button>
                    <Button onClick={() => navigate(`/admin/events/${event.id}/templates`)} className="justify-start">
                      <Calendar className="mr-2 h-4 w-4" />
                      Manage Templates
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/admin/events/${event.id}/analytics`)} className="justify-start">
                      <BarChart3 className="mr-2 h-4 w-4" />
                      View Analytics
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <UpgradePromptDialog
        open={showUpgradeDialog}
        onOpenChange={setShowUpgradeDialog}
        limitType="events"
        currentTier={subscription?.tier || 'free'}
        currentUsage={events.length}
        currentLimit={subscription?.events_limit || 1}
      />
    </div>
  );
}
