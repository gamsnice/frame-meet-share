import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Save } from "lucide-react";
import { toast } from "sonner";

interface EventFormData {
  name: string;
  slug: string;
  description: string;
  start_date: string;
  end_date: string;
  location: string;
  brand_primary_color: string;
  brand_secondary_color: string;
  brand_text_color: string;
  hero_title: string;
  hero_subtitle: string;
  helper_text: string;
  layout_preset: "A" | "B" | "C";
}

export default function EventEditor({ userId }: { userId: string }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    name: "",
    slug: "",
    description: "",
    start_date: "",
    end_date: "",
    location: "",
    brand_primary_color: "#2563EB",
    brand_secondary_color: "#F97316",
    brand_text_color: "#FFFFFF",
    hero_title: "",
    hero_subtitle: "",
    helper_text: "Tip: use a bright, close-up selfie for best results.",
    layout_preset: "A",
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          name: data.name,
          slug: data.slug,
          description: data.description || "",
          start_date: data.start_date,
          end_date: data.end_date,
          location: data.location || "",
          brand_primary_color: data.brand_primary_color,
          brand_secondary_color: data.brand_secondary_color,
          brand_text_color: data.brand_text_color,
          hero_title: data.hero_title,
          hero_subtitle: data.hero_subtitle || "",
          helper_text: data.helper_text || "",
          layout_preset: (data.layout_preset as "A" | "B" | "C") || "A",
        });
      }
    } catch (error: any) {
      toast.error("Failed to load event");
      console.error(error);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
      hero_title: formData.hero_title || `Create your "Meet me at ${name}" visual`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventId) {
        // Update existing event
        const { error } = await supabase
          .from("events")
          .update(formData)
          .eq("id", eventId);

        if (error) throw error;
        toast.success("Event updated successfully!");
      } else {
        // Create new event
        const { data, error } = await supabase
          .from("events")
          .insert([{ ...formData, owner_user_id: userId }])
          .select()
          .single();

        if (error) throw error;
        toast.success("Event created successfully!");
        navigate(`/admin/events/${data.id}/templates`);
        return;
      }

      navigate("/admin/events");
    } catch (error: any) {
      toast.error(error.message || "Failed to save event");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/admin/events")}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>
      </div>

      <div>
        <h1 className="text-3xl font-bold mb-2">
          {eventId ? "Edit Event" : "Create New Event"}
        </h1>
        <p className="text-muted-foreground">
          Set up your event visuals page with branding and content
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Basic Information</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Event Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                required
                placeholder="SKInnovation 2026"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">/e/</span>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: generateSlug(e.target.value) })}
                  required
                  placeholder="skinnovation-2026"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                This will be your event's unique URL
              </p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="A brief description of your event"
                rows={3}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="start_date">Start Date *</Label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="end_date">End Date *</Label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Innsbruck, Austria"
              />
            </div>
          </div>
        </Card>

        {/* Branding */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Branding</h2>
          <div className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.brand_primary_color}
                    onChange={(e) => setFormData({ ...formData, brand_primary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_primary_color}
                    onChange={(e) => setFormData({ ...formData, brand_primary_color: e.target.value })}
                    placeholder="#2563EB"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="secondary_color">Secondary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="secondary_color"
                    type="color"
                    value={formData.brand_secondary_color}
                    onChange={(e) => setFormData({ ...formData, brand_secondary_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_secondary_color}
                    onChange={(e) => setFormData({ ...formData, brand_secondary_color: e.target.value })}
                    placeholder="#F97316"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="text_color">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="text_color"
                    type="color"
                    value={formData.brand_text_color}
                    onChange={(e) => setFormData({ ...formData, brand_text_color: e.target.value })}
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_text_color}
                    onChange={(e) => setFormData({ ...formData, brand_text_color: e.target.value })}
                    placeholder="#FFFFFF"
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Event Page Content */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Event Page Content</h2>
          <div className="space-y-4">
            <div>
              <Label htmlFor="hero_title">Hero Title *</Label>
              <Input
                id="hero_title"
                value={formData.hero_title}
                onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
                required
                placeholder='Create your "Meet me at SKInnovation 2026" visual'
              />
            </div>

            <div>
              <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                placeholder="Pick a frame, add your selfie, and tell your network you're coming."
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="helper_text">Helper Text</Label>
              <Input
                id="helper_text"
                value={formData.helper_text}
                onChange={(e) => setFormData({ ...formData, helper_text: e.target.value })}
                placeholder="Tip: use a bright, close-up selfie for best results."
              />
            </div>
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/events")}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : eventId ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
