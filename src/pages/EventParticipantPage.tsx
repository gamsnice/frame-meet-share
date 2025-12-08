import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Globe, Instagram, Linkedin } from "lucide-react";
import { toast } from "sonner";
import TemplateSelector from "@/components/participant/TemplateSelector";
import ImageEditor from "@/components/participant/ImageEditor";
import { trackEvent } from "@/lib/analytics";
import { useIsMobile } from "@/hooks/use-mobile";
import { EventBase, Template } from "@/types";

export default function EventParticipantPage() {
  const { slug } = useParams();
  const [event, setEvent] = useState<EventBase | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const isMobile = useIsMobile();
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (slug) {
      loadEventData();
    }
  }, [slug]);

  // Set dynamic favicon
  useEffect(() => {
    if (event?.favicon_url) {
      const link = (document.querySelector("link[rel='icon']") as HTMLLinkElement) || document.createElement("link");
      link.rel = "icon";
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

  const handleTemplateSelect = async (template: Template) => {
    setSelectedTemplate(template);
    setUserImage(null); // Reset image when changing templates
    
    // Track template view
    if (event) {
      await trackEvent(event.id, template.id, "view");
    }

    // Auto-scroll to editor on mobile
    if (isMobile && editorRef.current) {
      setTimeout(() => {
        editorRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    }
  };

  const handleImageUpload = async (imageDataUrl: string) => {
    setUserImage(imageDataUrl);
    if (event && selectedTemplate) {
      await trackEvent(event.id, selectedTemplate.id, "upload");
    }
  };

  const handleResetTemplate = () => {
    setSelectedTemplate(null);
    setUserImage(null);
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
      {/* Header - Mobile Optimized */}
      <header
        className="relative overflow-hidden py-4 sm:py-6 md:py-8 lg:py-12"
        style={{ color: event.brand_text_color }}
      >
        {/* Gradient background using brand colors */}
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(135deg, ${event.brand_primary_color}, ${
              event.brand_secondary_color || event.brand_primary_color
            })`,
          }}
        />
        {/* Soft overlay for a modern look */}
        <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-soft-light bg-[radial-gradient(circle_at_top,_#ffffff,_transparent_60%)]" />

        <div className="relative container mx-auto px-3 sm:px-4">
          <div className="flex flex-col items-center gap-3 sm:gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-6">
            {/* Logo + titles */}
            <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 md:gap-6 w-full lg:w-auto">
              {event.logo_url && (
                <div className="flex-shrink-0 rounded-xl sm:rounded-2xl bg-white/10 backdrop-blur-sm px-3 py-2 sm:px-4 sm:py-3 md:px-5 md:py-4 shadow-sm">
                  <img
                    src={event.logo_url}
                    alt={event.name}
                    className="h-10 sm:h-12 md:h-16 lg:h-20 xl:h-24 w-auto max-w-[50vw] sm:max-w-[45vw] md:max-w-[260px] object-contain"
                  />
                </div>
              )}

              <div className="w-full text-center lg:text-left">
                <p className="text-[0.6rem] sm:text-xs uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-80 mb-0.5 sm:mb-1">
                  Create your event visual
                </p>
                <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold leading-tight mb-1 sm:mb-2 md:mb-3">
                  {event.hero_title}
                </h1>
                {event.hero_subtitle && (
                  <p className="text-xs sm:text-sm md:text-base lg:text-lg opacity-90 max-w-2xl mx-auto lg:mx-0 line-clamp-2 sm:line-clamp-none">
                    {event.hero_subtitle}
                  </p>
                )}
              </div>
            </div>

            {/* Event meta: date + location + social icons */}
            <div className="flex flex-col items-center lg:items-end gap-2 sm:gap-3">
              <div className="flex flex-wrap items-center justify-center lg:justify-end gap-1.5 sm:gap-2 md:gap-3">
                <Badge
                  variant="outline"
                  className="bg-black/5 border-white/30 backdrop-blur-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm"
                >
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  <span className="whitespace-nowrap">
                    {new Date(event.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} – {new Date(event.end_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </Badge>

                {event.location && (
                  <Badge
                    variant="outline"
                    className="bg-black/5 border-white/30 backdrop-blur-sm flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs md:text-sm"
                  >
                    <MapPin className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="truncate max-w-[120px] sm:max-w-none">{event.location}</span>
                  </Badge>
                )}
              </div>

              {/* Social Media Icons */}
              {(event.homepage_url || event.instagram_url || event.linkedin_url) && (
                <div className="flex items-center gap-1.5 sm:gap-2">
                  {event.homepage_url && (
                    <a
                      href={event.homepage_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-1.5 sm:p-2 transition-all hover:scale-110"
                      aria-label="Visit homepage"
                    >
                      <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  )}
                  {event.instagram_url && (
                    <a
                      href={event.instagram_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-1.5 sm:p-2 transition-all hover:scale-110"
                      aria-label="Follow on Instagram"
                    >
                      <Instagram className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  )}
                  {event.linkedin_url && (
                    <a
                      href={event.linkedin_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 rounded-full p-1.5 sm:p-2 transition-all hover:scale-110"
                      aria-label="Connect on LinkedIn"
                    >
                      <Linkedin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-3 sm:px-4 py-4 sm:py-6 md:py-8">
        {templates.length === 0 ? (
          <Card className="p-8 sm:p-12 text-center">
            <h3 className="text-lg sm:text-xl font-semibold mb-2">No templates available yet</h3>
            <p className="text-sm sm:text-base text-muted-foreground">The organizer hasn't created any frames yet. Check back soon!</p>
          </Card>
        ) : (
          <>
            {/* Mobile Layout: Editor first, then templates at bottom */}
            {isMobile ? (
              <div className="space-y-4">
                {/* Editor Section - Always visible on mobile */}
                <div ref={editorRef}>
                  {selectedTemplate ? (
                    <ImageEditor
                      template={selectedTemplate}
                      userImage={userImage}
                      onImageUpload={handleImageUpload}
                      onDownload={handleDownload}
                      onResetTemplate={handleResetTemplate}
                      helperText={event.helper_text}
                      eventSlug={slug || ""}
                      eventId={event.id}
                      isMobile={isMobile}
                    />
                  ) : (
                    <Card className="p-6 text-center bg-muted/50">
                      <p className="text-sm text-muted-foreground mb-1">Select a frame below to get started</p>
                    </Card>
                  )}
                </div>

                {/* Template Selector - at the bottom on mobile */}
                <TemplateSelector
                  templates={templates}
                  selectedTemplate={selectedTemplate}
                  onSelect={handleTemplateSelect}
                  isMobile={isMobile}
                />
              </div>
            ) : (
              /* Desktop Layout: Side by side */
              <div className="grid gap-8 lg:grid-cols-2">
                {/* Left Column: Template Selector only */}
                <div className="space-y-6">
                  <TemplateSelector
                    templates={templates}
                    selectedTemplate={selectedTemplate}
                    onSelect={handleTemplateSelect}
                    isMobile={false}
                  />
                </div>

                {/* Right Column: Image Editor - Sticky on scroll */}
                <div className="sticky top-4 self-start">
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
                      eventId={event.id}
                      isMobile={false}
                    />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t mt-8 sm:mt-16 py-6 sm:py-8 bg-card">
        <div className="container mx-auto px-3 sm:px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 sm:gap-4">
            {event.secondary_logo_url && (
              <img src={event.secondary_logo_url} alt="Partner logo" className="h-6 sm:h-8 w-auto object-contain" />
            )}
            <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left flex-1">Powered by MeetMeFrame</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
