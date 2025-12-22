import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import PhotoFrameMapper from "./PhotoFrameMapper";
import { FORMAT_DIMENSIONS_WITH_LABELS, type Template } from "@/types";
import { TemplateCard, CaptionsDialog, PlaceholderDialog } from "./template-manager";
import { useSubscriptionLimits } from "@/hooks/useSubscriptionLimits";
import { navigateToUpgrade } from "@/lib/navigation";

export default function TemplateManager({ userId }: { userId?: string }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false);
  const [placeholderTemplate, setPlaceholderTemplate] = useState<Template | null>(null);
  
  const { subscription, usage, canCreateTemplate, templatesRemaining, refresh: refreshLimits } = useSubscriptionLimits(userId || null);

  const [formData, setFormData] = useState({
    name: "",
    type: "Attendee",
    format: "square",
    image_url: "",
    photo_frame_x: 0.2,
    photo_frame_y: 0.2,
    photo_frame_width: 0.6,
    photo_frame_height: 0.6,
  });
  const [customType, setCustomType] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (eventId) {
      loadTemplates();
    }
  }, [eventId]);

  const loadTemplates = async () => {
    try {
      const { data, error } = await supabase
        .from("templates")
        .select(`
          *,
          placeholder_image:placeholder_images(image_url)
        `)
        .eq("event_id", eventId)
        .order("created_at");

      if (error) throw error;
      setTemplates(data || []);
    } catch (error: any) {
      toast.error("Failed to load templates");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openCreateDialog = () => {
    // Check template limit before opening create dialog
    if (!canCreateTemplate) {
      navigateToUpgrade(navigate, 'templates');
      return;
    }
    
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "Attendee",
      format: "square",
      image_url: "",
      photo_frame_x: 0.2,
      photo_frame_y: 0.2,
      photo_frame_width: 0.6,
      photo_frame_height: 0.6,
    });
    setCustomType("");
    setUploadedFile(null);
    setShowDialog(true);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    const predefinedTypes = ["Startup", "Investor", "Attendee", "Corporate", "Sponsor", "Partner", "Speaker", "Ecosystem"];
    const isCustomType = !predefinedTypes.includes(template.type);
    
    setFormData({
      name: template.name,
      type: isCustomType ? "custom" : template.type,
      format: template.format,
      image_url: template.image_url,
      photo_frame_x: template.photo_frame_x,
      photo_frame_y: template.photo_frame_y,
      photo_frame_width: template.photo_frame_width,
      photo_frame_height: template.photo_frame_height,
    });
    setCustomType(isCustomType ? template.type : "");
    setUploadedFile(null);
    setShowDialog(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/png") && !file.type.startsWith("image/svg")) {
      toast.error("Please upload a PNG or SVG file");
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setUploadedFile(file);

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData({ ...formData, image_url: previewUrl });
  };

  const handleSubmit = async () => {
    try {
      if (!uploadedFile && !editingTemplate) {
        toast.error("Please upload a template image");
        return;
      }

      if (!editingTemplate && !uploadedFile) {
        toast.error("Please upload a template image");
        return;
      }

      setUploadingFile(true);
      let imageUrl = formData.image_url;

      // Upload new file if provided
      if (uploadedFile) {
        const fileExt = uploadedFile.name.split(".").pop();
        const fileName = `${eventId}/${crypto.randomUUID()}.${fileExt}`;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from("event-assets")
          .upload(fileName, uploadedFile, {
            cacheControl: "3600",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const {
          data: { publicUrl },
        } = supabase.storage.from("event-assets").getPublicUrl(fileName);

        imageUrl = publicUrl;

        // Delete old file if editing
        if (editingTemplate?.image_url) {
          const oldPath = editingTemplate.image_url.split("/event-assets/")[1];
          if (oldPath) {
            await supabase.storage.from("event-assets").remove([oldPath]);
          }
        }
      }

      const templateData = {
        ...formData,
        type: formData.type === "custom" ? customType : formData.type,
        image_url: imageUrl,
      };

      if (editingTemplate) {
        const { error } = await supabase.from("templates").update(templateData).eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Template updated!");
      } else {
        const { error } = await supabase.from("templates").insert([{ ...templateData, event_id: eventId }]);

        if (error) throw error;
        toast.success("Template created!");
        refreshLimits(); // Refresh limits after creating template
      }

      setShowDialog(false);
      setUploadedFile(null);
      loadTemplates();
    } catch (error: any) {
      toast.error("Failed to save template");
      console.error(error);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this template? This will also remove all associated captions, placeholder images, and template-specific analytics data.")) return;

    try {
      const template = templates.find((t) => t.id === id);
      if (!template) {
        toast.error("Template not found");
        return;
      }

      // Collect storage paths to delete - Note: placeholder images are NOT deleted here
      // They remain in the library and can be reused
      const pathsToDelete: string[] = [];

      // Add template image path if exists
      if (template.image_url) {
        const imagePath = template.image_url.split("/event-assets/")[1];
        if (imagePath) {
          pathsToDelete.push(imagePath);
        }
      }

      // Delete template from database first (cascades to template_captions, sets null on stats)
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;

      // Delete images from storage after successful database deletion
      if (pathsToDelete.length > 0) {
        const { error: storageError } = await supabase.storage.from("event-assets").remove(pathsToDelete);
        if (storageError) {
          console.warn("Failed to delete some storage files:", storageError);
        }
      }

      toast.success("Template and all related data deleted successfully");
      loadTemplates();
      refreshLimits(); // Refresh limits after deleting template
    } catch (error: any) {
      console.error("Delete error:", error);
      toast.error(`Failed to delete template: ${error.message || "Unknown error"}`);
    }
  };

  const handleFrameUpdate = (x: number, y: number, width: number, height: number) => {
    setFormData({
      ...formData,
      photo_frame_x: x,
      photo_frame_y: y,
      photo_frame_width: width,
      photo_frame_height: height,
    });
  };

  if (loading) {
    return <div className="text-center py-12">Loading templates...</div>;
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/events")} size="sm" className="self-start">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Manage Templates</h1>
            <p className="text-sm text-muted-foreground">Create and customize visual frames</p>
          </div>
        </div>
        <Button onClick={openCreateDialog} className="w-full sm:w-auto min-h-[44px]">
          <Plus className="mr-2 h-4 w-4" />
          Add Template
          {templatesRemaining !== null && templatesRemaining <= 2 && (
            <span className="ml-2 text-xs opacity-75">({templatesRemaining} left)</span>
          )}
        </Button>
      </div>

      {templates.length === 0 ? (
        <Card className="p-12 text-center">
          <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold mb-2">No templates yet</h3>
          <p className="text-muted-foreground mb-6">Create your first template frame</p>
          <Button onClick={openCreateDialog}>
            <Plus className="mr-2 h-4 w-4" />
            Create Template
          </Button>
        </Card>
      ) : (
        <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              onEdit={openEditDialog}
              onDelete={handleDelete}
              onOpenCaptions={setSelectedTemplate}
              onOpenPlaceholder={(t) => {
                setPlaceholderTemplate(t);
                setShowPlaceholderDialog(true);
              }}
            />
          ))}
        </div>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label>Template Name</Label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Attendee – Square"
                />
              </div>
              <div>
                <Label>Type</Label>
                <Select value={formData.type} onValueChange={(v) => {
                  setFormData({ ...formData, type: v });
                  if (v !== "custom") setCustomType("");
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Startup">Startup</SelectItem>
                    <SelectItem value="Investor">Investor</SelectItem>
                    <SelectItem value="Attendee">Attendee</SelectItem>
                    <SelectItem value="Corporate">Corporate</SelectItem>
                    <SelectItem value="Sponsor">Sponsor</SelectItem>
                    <SelectItem value="Partner">Partner</SelectItem>
                    <SelectItem value="Speaker">Speaker</SelectItem>
                    <SelectItem value="Ecosystem">Ecosystem</SelectItem>
                    <SelectItem value="custom">Custom...</SelectItem>
                  </SelectContent>
                </Select>
                {formData.type === "custom" && (
                  <Input
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                    placeholder="Enter custom type"
                    className="mt-2"
                  />
                )}
              </div>
            </div>

            <div>
              <Label>Format</Label>
              <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(FORMAT_DIMENSIONS_WITH_LABELS).map(([key, { label }]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Template Image (PNG or SVG)</Label>
              <Input
                type="file"
                accept=".png,.svg,image/png,image/svg+xml"
                onChange={handleFileUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">Upload a PNG or SVG template image (max 10MB)</p>
              {editingTemplate && !uploadedFile && (
                <p className="text-xs text-muted-foreground mt-1">Leave empty to keep existing image</p>
              )}
            </div>

            {formData.image_url && (
              <PhotoFrameMapper
                imageUrl={formData.image_url}
                initialFrame={{
                  x: formData.photo_frame_x,
                  y: formData.photo_frame_y,
                  width: formData.photo_frame_width,
                  height: formData.photo_frame_height,
                }}
                onFrameChange={handleFrameUpdate}
              />
            )}

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDialog(false)} disabled={uploadingFile}>
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={uploadingFile}>
                {uploadingFile ? "Uploading..." : editingTemplate ? "Save Changes" : "Create Template"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Captions Dialog */}
      <CaptionsDialog
        template={selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
      />

      {/* Placeholder Dialog */}
      <PlaceholderDialog
        template={placeholderTemplate}
        eventId={eventId || ""}
        open={showPlaceholderDialog}
        onOpenChange={setShowPlaceholderDialog}
        onSaved={loadTemplates}
      />
    </div>
  );
}
