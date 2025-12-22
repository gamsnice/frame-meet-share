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
import BrandAssetUploader from "./BrandAssetUploader";

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
  logo_url: string;
  secondary_logo_url: string;
  favicon_url: string;
  hero_title: string;
  hero_subtitle: string;
  helper_text: string;
  layout_preset: "A" | "B" | "C";
  homepage_url: string;
  instagram_url: string;
  linkedin_url: string;
  photo_folder_button_text: string;
  photo_folder_button_url: string;
  photo_folder_button_color: string;
  photo_folder_button_opacity: number;
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
    logo_url: "",
    secondary_logo_url: "",
    favicon_url: "",
    hero_title: "",
    hero_subtitle: "",
    helper_text: "Tip: A bright, close-up picture makes visuals pop instantly.",
    layout_preset: "A",
    homepage_url: "",
    instagram_url: "",
    linkedin_url: "",
    photo_folder_button_text: "",
    photo_folder_button_url: "",
    photo_folder_button_color: "#FFFFFF",
    photo_folder_button_opacity: 1,
  });

  useEffect(() => {
    if (eventId) {
      loadEvent();
    }
  }, [eventId]);

  const loadEvent = async () => {
    try {
      const { data, error } = await supabase.from("events").select("*").eq("id", eventId).single();

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
          logo_url: data.logo_url || "",
          secondary_logo_url: data.secondary_logo_url || "",
          favicon_url: data.favicon_url || "",
          hero_title: data.hero_title,
          hero_subtitle: data.hero_subtitle || "",
          helper_text: data.helper_text || "",
          layout_preset: (data.layout_preset as "A" | "B" | "C") || "A",
          homepage_url: data.homepage_url || "",
          instagram_url: data.instagram_url || "",
          linkedin_url: data.linkedin_url || "",
          photo_folder_button_text: data.photo_folder_button_text || "",
          photo_folder_button_url: data.photo_folder_button_url || "",
          photo_folder_button_color: data.photo_folder_button_color || "#FFFFFF",
          photo_folder_button_opacity: data.photo_folder_button_opacity ?? 1,
        });
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to load event");
    }
  };

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

  const handleNameChange = (name: string) => {
    setFormData({
      ...formData,
      name,
      slug: formData.slug || generateSlug(name),
      hero_title: formData.hero_title || `Create your “Meet me at ${name}” visual in seconds`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (eventId) {
        const { error } = await supabase.from("events").update(formData).eq("id", eventId);

        if (error) throw error;

        toast.success("Event updated successfully!");
      } else {
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
        <h1 className="text-3xl font-bold mb-2">{eventId ? "Edit Event" : "Create a New Event"}</h1>
        <p className="text-muted-foreground">
          Set up your event page, customize your branding, and prepare everything attendees will use to create their
          visuals.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* BASIC INFORMATION */}
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
                placeholder="Example: Future Leaders Summit"
              />
            </div>

            <div>
              <Label htmlFor="slug">URL Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    slug: generateSlug(e.target.value),
                  })
                }
                required
                placeholder="futureleaderssummit"
              />
              <p className="text-xs text-muted-foreground mt-1">This becomes the unique URL for your event page.</p>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe what makes your event exciting, unique, or worth attending."
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
                placeholder="City, venue, or online"
              />
            </div>
          </div>
        </Card>

        {/* BRANDING */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">Event Branding</h2>

          {/* Brand Assets */}
          <div className="rounded-xl bg-primary/5 p-6 border border-primary/10">
            <h3 className="text-lg font-semibold mb-1 flex items-center gap-2">
              <span>📸</span> Brand Assets
            </h3>
            <p className="text-sm text-muted-foreground mb-6">
              Upload your logos and favicon to make your event page instantly recognizable.
            </p>

            <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              {eventId ? (
                <>
                  <BrandAssetUploader
                    eventId={eventId}
                    assetType="logo"
                    currentUrl={formData.logo_url}
                    onUploadComplete={(url) => setFormData({ ...formData, logo_url: url })}
                    recommendedSize="200×60px"
                  />
                  <BrandAssetUploader
                    eventId={eventId}
                    assetType="secondary-logo"
                    currentUrl={formData.secondary_logo_url}
                    onUploadComplete={(url) => setFormData({ ...formData, secondary_logo_url: url })}
                    recommendedSize="120×40px"
                  />
                  <BrandAssetUploader
                    eventId={eventId}
                    assetType="favicon"
                    currentUrl={formData.favicon_url}
                    onUploadComplete={(url) => setFormData({ ...formData, favicon_url: url })}
                    recommendedSize="32×32px"
                    acceptedFormats=".png,.ico"
                  />
                </>
              ) : (
                <div className="col-span-3 text-center py-8 text-muted-foreground text-sm">
                  Save your event first to upload brand assets.
                </div>
              )}
            </div>
          </div>

          {/* COLOR BRANDING */}
          <div className="rounded-xl bg-card p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🎨</span> Brand Colors
            </h3>
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
              <div>
                <Label htmlFor="primary_color">Primary Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="primary_color"
                    type="color"
                    value={formData.brand_primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_primary_color: e.target.value,
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_primary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_primary_color: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_secondary_color: e.target.value,
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_secondary_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_secondary_color: e.target.value,
                      })
                    }
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
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_text_color: e.target.value,
                      })
                    }
                    className="w-16 h-10 p-1"
                  />
                  <Input
                    value={formData.brand_text_color}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        brand_text_color: e.target.value,
                      })
                    }
                  />
                </div>
              </div>
            </div>
          </div>

          {/* LINKS */}
          <div className="rounded-xl bg-card p-6 border">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>🔗</span> Links & Social Media
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Add your website and social profiles — they’ll appear as icons on your event page header.
            </p>

            <div className="space-y-4">
              <div>
                <Label htmlFor="homepage_url">Homepage URL</Label>
                <Input
                  id="homepage_url"
                  value={formData.homepage_url}
                  onChange={(e) => setFormData({ ...formData, homepage_url: e.target.value })}
                  placeholder="https://yourevent.com"
                  type="url"
                />
              </div>

              <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <Label htmlFor="instagram_url">Instagram URL</Label>
                  <Input
                    id="instagram_url"
                    value={formData.instagram_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        instagram_url: e.target.value,
                      })
                    }
                    placeholder="https://instagram.com/yourpage"
                    type="url"
                  />
                </div>

                <div>
                  <Label htmlFor="linkedin_url">LinkedIn URL</Label>
                  <Input
                    id="linkedin_url"
                    value={formData.linkedin_url}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        linkedin_url: e.target.value,
                      })
                    }
                    placeholder="https://linkedin.com/company/yourbrand"
                    type="url"
                  />
                </div>
              </div>

              {/* Photo Folder Button */}
              <div className="border-t pt-4 mt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span>📷</span>
                  <h4 className="font-medium">Photo Folder Button (Optional)</h4>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Add a button that links to an external photo folder (e.g., Google Drive, Dropbox, event gallery).
                  Leave empty to hide the button.
                </p>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
                  <div>
                    <Label htmlFor="photo_folder_button_text">Button Text</Label>
                    <Input
                      id="photo_folder_button_text"
                      value={formData.photo_folder_button_text}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          photo_folder_button_text: e.target.value,
                        })
                      }
                      placeholder="e.g., View Event Photos"
                    />
                  </div>
                  <div>
                    <Label htmlFor="photo_folder_button_url">Button Link (URL)</Label>
                    <Input
                      id="photo_folder_button_url"
                      value={formData.photo_folder_button_url}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          photo_folder_button_url: e.target.value,
                        })
                      }
                      placeholder="https://drive.google.com/..."
                      type="url"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label>Button Color & Opacity</Label>
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <Input
                          id="photo_folder_button_color"
                          type="color"
                          value={formData.photo_folder_button_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              photo_folder_button_color: e.target.value,
                            })
                          }
                          className="w-12 h-12 p-1 cursor-pointer rounded-lg border-2 border-border"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <Input
                          value={formData.photo_folder_button_color}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              photo_folder_button_color: e.target.value,
                            })
                          }
                          placeholder="#FFFFFF"
                          className="font-mono text-sm uppercase"
                        />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Label htmlFor="photo_folder_button_opacity" className="text-sm text-muted-foreground shrink-0">
                        Opacity
                      </Label>
                      <Input
                        id="photo_folder_button_opacity"
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={formData.photo_folder_button_opacity}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            photo_folder_button_opacity: parseFloat(e.target.value),
                          })
                        }
                        className="flex-1 h-2 accent-primary"
                      />
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {Math.round(formData.photo_folder_button_opacity * 100)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* EVENT PAGE CONTENT */}
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
                placeholder="Create your “Meet me at..” visual"
              />
            </div>

            <div>
              <Label htmlFor="hero_subtitle">Hero Subtitle</Label>
              <Textarea
                id="hero_subtitle"
                value={formData.hero_subtitle}
                onChange={(e) => setFormData({ ...formData, hero_subtitle: e.target.value })}
                placeholder="A short line that sets the vibe — e.g. “Join the movement. Share the excitement.”"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="helper_text">Helper Text</Label>
              <Input
                id="helper_text"
                value={formData.helper_text}
                onChange={(e) => setFormData({ ...formData, helper_text: e.target.value })}
                placeholder="Tip: A close-up, well-lit photo creates the best result."
              />
            </div>
          </div>
        </Card>

        <div className="flex flex-col-reverse sm:flex-row justify-end gap-3 sm:gap-4">
          <Button type="button" variant="outline" onClick={() => navigate("/admin/events")} className="min-h-[44px]">
            Cancel
          </Button>

          <Button type="submit" disabled={loading} className="min-h-[44px]">
            <Save className="mr-2 h-4 w-4" />
            {loading ? "Saving..." : eventId ? "Save Changes" : "Create Event"}
          </Button>
        </div>
      </form>
    </div>
  );
}
