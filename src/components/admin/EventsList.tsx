import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Plus, Calendar, Copy, ExternalLink, Pencil, BarChart3 } from "lucide-react";
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

export default function EventsList({ userId }: { userId: string }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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
    } catch (error: any) {
      toast.error("Failed to load events");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const copyEventLink = (slug: string) => {
    const url = `${window.location.origin}/e/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success("Event link copied!");
  };

  if (loading) {
    return <div className="text-center py-12">Loading events...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Events</h1>
          <p className="text-muted-foreground mt-1">Manage your event visuals pages</p>
        </div>
        <Button onClick={() => navigate("/admin/events/new")} size="lg">
          <Plus className="mr-2 h-5 w-5" />
          Create New Event
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
        <div className="grid gap-6">
          {events.map((event) => (
            <Card key={event.id} className="p-6">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-xl mb-2">{event.name}</h3>
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

                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg mt-4 max-w-md">
                    <code className="text-sm flex-1 truncate">{window.location.origin}/e/{event.slug}</code>
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
                </div>

                <div className="flex flex-col gap-2 lg:min-w-[200px]">
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/admin/events/${event.id}/edit`)}
                    className="justify-start"
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit Event
                  </Button>
                  <Button 
                    onClick={() => navigate(`/admin/events/${event.id}/templates`)}
                    className="justify-start"
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Manage Templates
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => navigate(`/admin/events/${event.id}/analytics`)}
                    className="justify-start"
                  >
                    <BarChart3 className="mr-2 h-4 w-4" />
                    View Analytics
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
