import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import TemplateSelector from "@/components/participant/TemplateSelector";
import ImageEditor from "@/components/participant/ImageEditor";
import CaptionsPanel from "@/components/participant/CaptionsPanel";
import { trackEvent } from "@/lib/analytics";

interface Event {
  id: string;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_text_color: string;
  logo_url?: string;
  secondary_logo_url?: string;
  favicon_url?: string;
  hero_title: string;
  hero_subtitle: string;
  helper_text: string;
}

interface Template {
  id: string;
  name: string;
  type: string;
  format: string;
  image_url: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
  placeholder_image_url?: string;
  placeholder_scale?: number;
  placeholder_x?: number;
  placeholder_y?: number;
}

export default function EventParticipantPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  // Set dynamic favicon
  useEffect(() => {
    if (event?.favicon_url) {
      const link = document.querySelector("link[rel='icon']") as HTMLLinkElement || document.createElement('link');
      link.rel = 'icon';
      link.href = event.favicon_url;
      if (!document.querySelector("link[rel='icon']")) {
        document.head.appendChild(link);
      }
    }
  }, [event?.favicon_url]);

  const loadEventData = async () => {
    try {
      // Load event
      const { data: eventData, error: eventError } = await supabase
        .from("events")
        .select("*")
        .eq("slug", slug)
        .single();

      if (eventError) throw eventError;
      if (!eventData) {
        toast.error("Event not found");
        return;
      }

      setEvent(eventData);

      // Load templates
      const { data: templatesData, error: templatesError } = await supabase
        .from("templates")
        .select("*")
        .eq("event_id", eventData.id)
        .order("created_at");

      if (templatesError) throw templatesError;
      setTemplates(templatesData || []);

      // Track page view
      await trackEvent(eventData.id, null, "view");
    } catch (error: any) {
      console.error("Failed to load event:", error);
      toast.error("Failed to load event data");
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setUserImage(null); // Reset image when changing templates
  };

  const handleImageUpload = async (imageDataUrl: string) => {
    setUserImage(imageDataUrl);
    if (event && selectedTemplate) {
      await trackEvent(event.id, selectedTemplate.id, "upload");
    }
  };

  const handleDownload = async () => {
    if (event && selectedTemplate) {
      await trackEvent(event.id, selectedTemplate.id, "download");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Loading event...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="p-12 text-center max-w-md">
          <h1 className="text-3xl font-bold mb-4">404</h1>
          <p className="text-xl text-muted-foreground mb-6">This MeetMeFrame page doesn't exist.</p>
          <Button onClick={() => (window.location.href = "/")}>Go to Homepage</Button>
        </Card>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{
        background: `linear-gradient(135deg, ${event.brand_primary_color}15, ${event.brand_secondary_color}15)`,
      }}
    >
      {/* Header */}
      <header
        className="py-8 md:py-12"
        style={{ backgroundColor: event.brand_primary_color, color: event.brand_text_color }}
      >
        <div className="container mx-auto px-4">
          <div className="flex items-start gap-4 md:gap-6 mb-6">
            {event.logo_url && (
              <img
                src={event.logo_url}
                alt={event.name}
                className="h-12 md:h-16 w-auto object-contain animate-fade-in"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl md:text-5xl font-bold mb-3 animate-fade-in">{event.hero_title}</h1>
              {event.hero_subtitle && (
                <p className="text-lg md:text-xl opacity-90 mb-4 animate-fade-in" style={{ animationDelay: "0.1s" }}>
                  {event.hero_subtitle}
                </p>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-4 text-sm md:text-base animate-fade-in" style={{ animationDelay: "0.2s" }}>
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              <span>
                {new Date(event.start_date).toLocaleDateString()} -{" "}
                {new Date(event.end_date).toLocaleDateString()}
              </span>
            </div>
            {event.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                <span>{event.location}</span>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {templates.length === 0 ? (
          <Card className="p-12 text-center">
            <h3 className="text-xl font-semibold mb-2">No templates available yet</h3>
            <p className="text-muted-foreground">The organizer hasn't created any frames yet. Check back soon!</p>
          </Card>
        ) : (
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Template Selector & Captions */}
            <div className="space-y-6">
              <TemplateSelector
                templates={templates}
                selectedTemplate={selectedTemplate}
                onSelect={handleTemplateSelect}
              />

              {selectedTemplate && (
                <CaptionsPanel templateId={selectedTemplate.id} eventId={event.id} />
              )}
            </div>

            {/* Right Column: Image Editor */}
            <div className="lg:sticky lg:top-8 lg:self-start">
              {!selectedTemplate ? (
                <Card className="p-12 text-center">
                  <p className="text-muted-foreground mb-2">Choose your frame first</p>
                  <p className="text-sm text-muted-foreground">Select a template from the left to get started</p>
                </Card>
              ) : (
                <ImageEditor
                  template={selectedTemplate}
                  userImage={userImage}
                  onImageUpload={handleImageUpload}
                  onDownload={handleDownload}
                  helperText={event.helper_text}
                  eventSlug={slug || ""}
                />
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-16 py-8 bg-card">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {event.secondary_logo_url && (
              <img
                src={event.secondary_logo_url}
                alt="Partner logo"
                className="h-8 w-auto object-contain"
              />
            )}
            <p className="text-sm text-muted-foreground text-center md:text-left flex-1">
              Powered by MeetMeFrame
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
