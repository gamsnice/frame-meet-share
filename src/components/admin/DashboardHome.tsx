import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Calendar, Eye, Download, Copy, Plus, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface Event {
  id: string;
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
}

interface DashboardStats {
  totalEvents: number;
  totalViews: number;
  totalDownloads: number;
}

export default function DashboardHome({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [stats, setStats] = useState<DashboardStats>({ totalEvents: 0, totalViews: 0, totalDownloads: 0 });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadData();
  }, [userId]);

  const loadData = async () => {
    try {
      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from("events")
        .select("*")
        .eq("owner_user_id", userId)
        .order("created_at", { ascending: false });

      if (eventsError) throw eventsError;
      setEvents(eventsData || []);

      // Load aggregate stats
      if (eventsData && eventsData.length > 0) {
        const eventIds = eventsData.map(e => e.id);
        const { data: statsData, error: statsError } = await supabase
          .from("event_stats_daily")
          .select("views_count, downloads_count")
          .in("event_id", eventIds);

        if (!statsError && statsData) {
          const totalViews = statsData.reduce((sum, s) => sum + (s.views_count || 0), 0);
          const totalDownloads = statsData.reduce((sum, s) => sum + (s.downloads_count || 0), 0);
          setStats({
            totalEvents: eventsData.length,
            totalViews,
            totalDownloads,
          });
        }
      } else {
        setStats({ totalEvents: 0, totalViews: 0, totalDownloads: 0 });
      }
    } catch (error: any) {
      toast.error("Failed to load dashboard data");
      console.error(error);
    } finally {
      setLoading(false);
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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground">Let's frame your next event.</p>
        </div>
        <Button onClick={() => navigate("/admin/events/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Events</p>
              <p className="text-3xl font-bold mt-2">{stats.totalEvents}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Calendar className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Page Views</p>
              <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Downloads</p>
              <p className="text-3xl font-bold mt-2">{stats.totalDownloads}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Your Events</h2>
          <Button variant="outline" onClick={() => navigate("/admin/events")}>
            View All
          </Button>
        </div>

        {events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No events yet</h3>
            <p className="text-muted-foreground mb-6">Create your first event visuals page to get started</p>
            <Button onClick={() => navigate("/admin/events/new")}>
              <Plus className="mr-2 h-4 w-4" />
              Create Your First Event
            </Button>
          </Card>
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
                  <Button 
                    size="sm" 
                    variant="ghost"
                    onClick={() => window.open(`/e/${event.slug}`, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                  >
                    Edit Event
                  </Button>
                  <Button 
                    size="sm" 
                    className="flex-1"
                    onClick={() => navigate(`/admin/events/${event.id}/templates`)}
                  >
                    Manage Templates
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
