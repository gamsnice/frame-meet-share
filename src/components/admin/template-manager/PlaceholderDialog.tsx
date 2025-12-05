import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { PlaceholderEditor } from "../PlaceholderEditor";
import type { Template } from "@/types";

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
  const [placeholderFile, setPlaceholderFile] = useState<File | null>(null);
  const [placeholderPreview, setPlaceholderPreview] = useState<string>("");
  const [placeholderScale, setPlaceholderScale] = useState(1);
  const [placeholderPosition, setPlaceholderPosition] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (template) {
      setPlaceholderPreview(template.placeholder_image_url || "");
      setPlaceholderScale(template.placeholder_scale || 1);
      setPlaceholderPosition({ x: template.placeholder_x || 0, y: template.placeholder_y || 0 });
      setPlaceholderFile(null);
    }
  }, [template]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setPlaceholderFile(file);
    const previewUrl = URL.createObjectURL(file);
    setPlaceholderPreview(previewUrl);
  };

  const savePlaceholder = async () => {
    if (!template) return;

    setSaving(true);
    try {
      let placeholderUrl = template.placeholder_image_url || "";

      if (placeholderFile) {
        const fileExt = placeholderFile.name.split(".").pop();
        const fileName = `${eventId}/placeholders/${template.id}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("event-assets")
          .upload(fileName, placeholderFile, {
            cacheControl: "3600",
            upsert: true,
          });

        if (uploadError) throw uploadError;

        const {
          data: { publicUrl },
        } = supabase.storage.from("event-assets").getPublicUrl(fileName);

        placeholderUrl = publicUrl;
      }

      const { error } = await supabase
        .from("templates")
        .update({
          placeholder_image_url: placeholderUrl,
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

  const removePlaceholder = async () => {
    if (!template) return;

    try {
      if (template.placeholder_image_url) {
        const path = template.placeholder_image_url.split("/event-assets/")[1];
        if (path) {
          await supabase.storage.from("event-assets").remove([path]);
        }
      }

      const { error } = await supabase
        .from("templates")
        .update({
          placeholder_image_url: null,
          placeholder_scale: 1,
          placeholder_x: 0,
          placeholder_y: 0,
        })
        .eq("id", template.id);

      if (error) throw error;
      toast.success("Placeholder removed!");
      onOpenChange(false);
      onSaved();
    } catch (error: any) {
      toast.error("Failed to remove placeholder");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-lg max-h-[85vh] overflow-hidden flex flex-col p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>Manage Placeholder - {template?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3 overflow-y-auto flex-1 pr-2">
          <div>
            <Label>Placeholder Photo</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} className="cursor-pointer" />
            <p className="text-xs text-muted-foreground mt-1">Upload a sample photo to show in previews (max 10MB)</p>
          </div>

          {placeholderPreview && template && (
            <PlaceholderEditor
              template={template}
              placeholderImage={placeholderPreview}
              initialScale={placeholderScale}
              initialX={placeholderPosition.x}
              initialY={placeholderPosition.y}
              onPositionChange={(x, y, scale) => {
                setPlaceholderPosition({ x, y });
                setPlaceholderScale(scale);
              }}
            />
          )}
        </div>
        <div className="flex justify-between gap-2 pt-4 border-t sticky bottom-0 bg-background">
          <Button
            variant="outline"
            onClick={removePlaceholder}
            disabled={!template?.placeholder_image_url}
          >
            Remove Placeholder
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={savePlaceholder} disabled={!placeholderPreview || saving}>
              {saving ? "Saving..." : "Save Placeholder"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
