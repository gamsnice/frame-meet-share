import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { PlaceholderEditor } from "../PlaceholderEditor";
import { Upload, ImageIcon, Check } from "lucide-react";
import type { Template, PlaceholderImage } from "@/types";

interface PlaceholderDialogProps {
  template: Template | null;
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaved: () => void;
}

export function PlaceholderDialog({
  template,
  eventId,
  open,
  onOpenChange,
  onSaved,
}: PlaceholderDialogProps) {
  const [libraryImages, setLibraryImages] = useState<PlaceholderImage[]>([]);
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [placeholderScale, setPlaceholderScale] = useState(1);
  const [placeholderPosition, setPlaceholderPosition] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loadingLibrary, setLoadingLibrary] = useState(true);
  const [activeTab, setActiveTab] = useState("library");

  // Load library images
  useEffect(() => {
    if (open) {
      loadLibraryImages();
    }
  }, [open]);

  // Set initial values when template changes
  useEffect(() => {
    if (template && open) {
      if (template.placeholder_image_id) {
        setSelectedImageId(template.placeholder_image_id);
        // Find the image URL from library or use the URL directly
        const libraryImg = libraryImages.find(img => img.id === template.placeholder_image_id);
        setSelectedImageUrl(libraryImg?.image_url || template.placeholder_image?.image_url || template.placeholder_image_url || "");
      } else {
        setSelectedImageId(null);
        setSelectedImageUrl("");
      }
      setPlaceholderScale(template.placeholder_scale || 1);
      setPlaceholderPosition({ x: template.placeholder_x || 0, y: template.placeholder_y || 0 });
    }
  }, [template, open, libraryImages]);

  const loadLibraryImages = async () => {
    setLoadingLibrary(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("placeholder_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setLibraryImages(data || []);
    } catch (error: any) {
      console.error("Failed to load library:", error);
    } finally {
      setLoadingLibrary(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload to storage with unique filename
      const fileExt = file.name.split(".").pop();
      const fileName = `placeholders/${user.id}/${Date.now()}_${file.name}`;

      const { error: uploadError } = await supabase.storage
        .from("event-assets")
        .upload(fileName, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("event-assets")
        .getPublicUrl(fileName);

      // Insert into placeholder_images table
      const { data: newImage, error: insertError } = await supabase
        .from("placeholder_images")
        .insert({
          user_id: user.id,
          image_url: publicUrl,
          original_filename: file.name,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Add to library and select it
      setLibraryImages(prev => [newImage, ...prev]);
      setSelectedImageId(newImage.id);
      setSelectedImageUrl(newImage.image_url);
      setPlaceholderScale(1);
      setPlaceholderPosition({ x: 0, y: 0 });
      setActiveTab("library");
      
      toast.success("Image uploaded to library!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Failed to upload image");
    } finally {
      setUploading(false);
      // Reset file input
      e.target.value = "";
    }
  };

  const selectImageFromLibrary = (image: PlaceholderImage) => {
    setSelectedImageId(image.id);
    setSelectedImageUrl(image.image_url);
    // Reset position when selecting new image
    if (image.id !== template?.placeholder_image_id) {
      setPlaceholderScale(1);
      setPlaceholderPosition({ x: 0, y: 0 });
    }
  };

  const savePlaceholder = async () => {
    if (!template) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from("templates")
        .update({
          placeholder_image_id: selectedImageId,
          placeholder_scale: placeholderScale,
          placeholder_x: placeholderPosition.x,
          placeholder_y: placeholderPosition.y,
        })
        .eq("id", template.id);

      if (error) throw error;
      toast.success("Placeholder saved!");
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      console.error("Placeholder save error:", error);
      toast.error(error.message || "Failed to save placeholder");
    } finally {
      setSaving(false);
    }
  };

  const removePlaceholderFromTemplate = async () => {
    if (!template) return;

    try {
      const { error } = await supabase
        .from("templates")
        .update({
          placeholder_image_id: null,
          placeholder_scale: 1,
          placeholder_x: 0,
          placeholder_y: 0,
        })
        .eq("id", template.id);

      if (error) throw error;
      
      // Reset local state so dialog shows empty state
      setSelectedImageId(null);
      setSelectedImageUrl("");
      setPlaceholderScale(1);
      setPlaceholderPosition({ x: 0, y: 0 });
      
      toast.success("Placeholder removed from template");
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error("Failed to remove placeholder");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Manage Placeholder - {template?.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="library" className="gap-2">
              <ImageIcon className="h-4 w-4" />
              Library
            </TabsTrigger>
            <TabsTrigger value="upload" className="gap-2">
              <Upload className="h-4 w-4" />
              Upload New
            </TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="flex-1 overflow-y-auto mt-4">
            {loadingLibrary ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="aspect-square bg-muted rounded-lg animate-pulse" />
                ))}
              </div>
            ) : libraryImages.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No images in library yet.</p>
                <Button
                  variant="outline"
                  className="mt-3"
                  onClick={() => setActiveTab("upload")}
                >
                  Upload your first image
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {libraryImages.map((img) => (
                  <button
                    key={img.id}
                    onClick={() => selectImageFromLibrary(img)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:opacity-90 bg-muted/50 ${
                      selectedImageId === img.id
                        ? "border-primary ring-2 ring-primary/20"
                        : "border-transparent hover:border-muted-foreground/20"
                    }`}
                  >
                    <img
                      src={img.image_url}
                      alt={img.original_filename}
                      className="w-full h-full object-contain p-1"
                    />
                    {selectedImageId === img.id && (
                      <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                        <div className="bg-primary rounded-full p-1">
                          <Check className="h-4 w-4 text-primary-foreground" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="upload" className="mt-4">
            <div className="space-y-4">
              <div>
                <Label>Upload New Image to Library</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploading}
                  className="cursor-pointer mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Max 10MB. Image will be added to your library for reuse.
                </p>
              </div>
              {uploading && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-r-transparent" />
                  Uploading...
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* Position Editor - show when image is selected */}
        {selectedImageUrl && template && (
          <div className="mt-4 border-t pt-4">
            <Label className="mb-2 block">Position & Scale</Label>
            <PlaceholderEditor
              template={template}
              placeholderImage={selectedImageUrl}
              initialScale={placeholderScale}
              initialX={placeholderPosition.x}
              initialY={placeholderPosition.y}
              onPositionChange={(x, y, scale) => {
                setPlaceholderPosition({ x, y });
                setPlaceholderScale(scale);
              }}
            />
          </div>
        )}

        <div className="flex justify-between gap-2 pt-4 border-t mt-4">
          <Button
            variant="outline"
            onClick={removePlaceholderFromTemplate}
            disabled={!template?.placeholder_image_id}
          >
            Remove from Template
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={savePlaceholder} disabled={!selectedImageId || saving}>
              {saving ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
