import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Pencil, Trash2, Image as ImageIcon, X, User } from "lucide-react";
import { toast } from "sonner";
import PhotoFrameMapper from "./PhotoFrameMapper";
import { PlaceholderEditor } from "./PlaceholderEditor";

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

interface Caption {
  id: string;
  caption_text: string;
}

const FORMAT_DIMENSIONS = {
  square: { width: 1080, height: 1080, label: "Square (1080x1080)" },
  story: { width: 1080, height: 1920, label: "Story (1080x1920)" },
  landscape: { width: 1200, height: 630, label: "Landscape (1200x630)" },
  portrait: { width: 1080, height: 1350, label: "Portrait (1080x1350)" },
};

const FORMAT_ASPECT_RATIOS = {
  square: "aspect-square",
  story: "aspect-[9/16]",
  landscape: "aspect-[1200/630]",
  portrait: "aspect-[4/5]",
};

export default function TemplateManager() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [newCaption, setNewCaption] = useState("");
  const [showPlaceholderDialog, setShowPlaceholderDialog] = useState(false);
  const [placeholderTemplate, setPlaceholderTemplate] = useState<Template | null>(null);
  const [placeholderFile, setPlaceholderFile] = useState<File | null>(null);
  const [placeholderPreview, setPlaceholderPreview] = useState<string>("");
  const [placeholderScale, setPlaceholderScale] = useState(1);
  const [placeholderPosition, setPlaceholderPosition] = useState({ x: 0, y: 0 });
  const [savingPlaceholder, setSavingPlaceholder] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    type: "ATTENDEE",
    format: "square",
    image_url: "",
    photo_frame_x: 0.2,
    photo_frame_y: 0.2,
    photo_frame_width: 0.6,
    photo_frame_height: 0.6,
  });
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
        .select("*")
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

  const loadCaptions = async (templateId: string) => {
    try {
      const { data, error } = await supabase
        .from("template_captions")
        .select("*")
        .eq("template_id", templateId);

      if (error) throw error;
      setCaptions(data || []);
    } catch (error: any) {
      toast.error("Failed to load captions");
    }
  };

  const openCreateDialog = () => {
    setEditingTemplate(null);
    setFormData({
      name: "",
      type: "ATTENDEE",
      format: "square",
      image_url: "",
      photo_frame_x: 0.2,
      photo_frame_y: 0.2,
      photo_frame_width: 0.6,
      photo_frame_height: 0.6,
    });
    setUploadedFile(null);
    setShowDialog(true);
  };

  const openEditDialog = (template: Template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      type: template.type,
      format: template.format,
      image_url: template.image_url,
      photo_frame_x: template.photo_frame_x,
      photo_frame_y: template.photo_frame_y,
      photo_frame_width: template.photo_frame_width,
      photo_frame_height: template.photo_frame_height,
    });
    setUploadedFile(null);
    setShowDialog(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/png') && !file.type.startsWith('image/svg')) {
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
        const fileExt = uploadedFile.name.split('.').pop();
        const fileName = `${eventId}/${crypto.randomUUID()}.${fileExt}`;
        
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('event-assets')
          .upload(fileName, uploadedFile, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('event-assets')
          .getPublicUrl(fileName);

        imageUrl = publicUrl;

        // Delete old file if editing
        if (editingTemplate?.image_url) {
          const oldPath = editingTemplate.image_url.split('/event-assets/')[1];
          if (oldPath) {
            await supabase.storage.from('event-assets').remove([oldPath]);
          }
        }
      }

      const templateData = {
        ...formData,
        image_url: imageUrl
      };

      if (editingTemplate) {
        const { error } = await supabase
          .from("templates")
          .update(templateData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast.success("Template updated!");
      } else {
        const { error } = await supabase
          .from("templates")
          .insert([{ ...templateData, event_id: eventId }]);

        if (error) throw error;
        toast.success("Template created!");
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
    if (!confirm("Delete this template?")) return;

    try {
      // Get template to find image URL
      const template = templates.find(t => t.id === id);
      
      // Delete from database
      const { error } = await supabase.from("templates").delete().eq("id", id);
      if (error) throw error;

      // Delete image from storage
      if (template?.image_url) {
        const path = template.image_url.split('/event-assets/')[1];
        if (path) {
          await supabase.storage.from('event-assets').remove([path]);
        }
      }

      toast.success("Template deleted");
      loadTemplates();
    } catch (error: any) {
      toast.error("Failed to delete template");
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

  const openCaptionsDialog = (template: Template) => {
    setSelectedTemplate(template);
    loadCaptions(template.id);
  };

  const addCaption = async () => {
    if (!newCaption.trim() || !selectedTemplate) return;

    try {
      const { error } = await supabase
        .from("template_captions")
        .insert([{ template_id: selectedTemplate.id, caption_text: newCaption }]);

      if (error) throw error;
      toast.success("Caption added!");
      setNewCaption("");
      loadCaptions(selectedTemplate.id);
    } catch (error: any) {
      toast.error("Failed to add caption");
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      const { error } = await supabase.from("template_captions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Caption deleted");
      if (selectedTemplate) loadCaptions(selectedTemplate.id);
    } catch (error: any) {
      toast.error("Failed to delete caption");
    }
  };

  const openPlaceholderDialog = (template: Template) => {
    setPlaceholderTemplate(template);
    setPlaceholderPreview(template.placeholder_image_url || "");
    setPlaceholderScale(template.placeholder_scale || 1);
    setPlaceholderPosition({ x: template.placeholder_x || 0, y: template.placeholder_y || 0 });
    setPlaceholderFile(null);
    setShowPlaceholderDialog(true);
  };

  const handlePlaceholderFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
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
    if (!placeholderTemplate) return;
    
    setSavingPlaceholder(true);
    try {
      let placeholderUrl = placeholderTemplate.placeholder_image_url || "";

      if (placeholderFile) {
        const fileExt = placeholderFile.name.split('.').pop();
        const fileName = `${eventId}/placeholders/${placeholderTemplate.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('event-assets')
          .upload(fileName, placeholderFile, {
            cacheControl: '3600',
            upsert: true
          });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('event-assets')
          .getPublicUrl(fileName);

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
        .eq("id", placeholderTemplate.id);

      if (error) throw error;
      toast.success("Placeholder saved!");
      setShowPlaceholderDialog(false);
      loadTemplates();
    } catch (error: any) {
      console.error("Placeholder save error:", error);
      toast.error(error.message || "Failed to save placeholder");
    } finally {
      setSavingPlaceholder(false);
    }
  };

  const removePlaceholder = async () => {
    if (!placeholderTemplate) return;

    try {
      if (placeholderTemplate.placeholder_image_url) {
        const path = placeholderTemplate.placeholder_image_url.split('/event-assets/')[1];
        if (path) {
          await supabase.storage.from('event-assets').remove([path]);
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
        .eq("id", placeholderTemplate.id);

      if (error) throw error;
      toast.success("Placeholder removed!");
      setShowPlaceholderDialog(false);
      loadTemplates();
    } catch (error: any) {
      toast.error("Failed to remove placeholder");
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading templates...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Manage Templates</h1>
            <p className="text-muted-foreground">Create and customize visual frames</p>
          </div>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="mr-2 h-4 w-4" />
          Add Template
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
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.map((template) => (
            <Card key={template.id} className="p-4 group hover:shadow-hover transition-shadow">
              <div className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} rounded-lg bg-muted mb-4 relative overflow-hidden`}>
                <img
                  src={template.image_url}
                  alt={template.name}
                  className="w-full h-full object-contain"
                />
              </div>
              <h3 className="font-semibold mb-1">{template.name}</h3>
              <div className="flex gap-2 text-xs mb-3">
                <span className="px-2 py-1 bg-primary/10 text-primary rounded">{template.type}</span>
                <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
                  {FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS]?.label}
                </span>
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openEditDialog(template)}>
                    <Pencil className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => openCaptionsDialog(template)}>
                    Captions
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleDelete(template.id)}>
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => openPlaceholderDialog(template)}>
                  <User className="mr-1 h-3 w-3" />
                  Placeholder
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Template Editor Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? "Edit Template" : "Create Template"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
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
                <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SPEAKER">Speaker</SelectItem>
                    <SelectItem value="ATTENDEE">Attendee</SelectItem>
                    <SelectItem value="SPONSOR">Sponsor</SelectItem>
                    <SelectItem value="CUSTOM">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Format</Label>
              <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="square">Square (1080x1080)</SelectItem>
                  <SelectItem value="story">Story (1080x1920)</SelectItem>
                  <SelectItem value="landscape">Landscape (1200x630)</SelectItem>
                  <SelectItem value="portrait">Portrait (1080x1350)</SelectItem>
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
              <p className="text-xs text-muted-foreground mt-1">
                Upload a PNG or SVG template image (max 10MB)
              </p>
              {editingTemplate && !uploadedFile && (
                <p className="text-xs text-muted-foreground mt-1">
                  Leave empty to keep existing image
                </p>
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
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Manage Captions - {selectedTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex gap-2">
              <Textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Add a suggested caption..."
                rows={3}
              />
            </div>
            <Button onClick={addCaption} className="w-full">
              Add Caption
            </Button>

            <div className="space-y-2">
              {captions.map((caption) => (
                <Card key={caption.id} className="p-3 flex justify-between items-start gap-2">
                  <p className="text-sm flex-1">{caption.caption_text}</p>
                  <Button size="sm" variant="ghost" onClick={() => deleteCaption(caption.id)}>
                    <X className="h-4 w-4" />
                  </Button>
                </Card>
              ))}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Placeholder Dialog */}
      <Dialog open={showPlaceholderDialog} onOpenChange={setShowPlaceholderDialog}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Manage Placeholder - {placeholderTemplate?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 overflow-y-auto flex-1 pr-2">
            <div>
              <Label>Placeholder Photo</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handlePlaceholderFileUpload}
                className="cursor-pointer"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Upload a sample photo to show in previews (max 10MB)
              </p>
            </div>

            {placeholderPreview && placeholderTemplate && (
              <PlaceholderEditor
                template={placeholderTemplate}
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
              disabled={!placeholderTemplate?.placeholder_image_url}
            >
              Remove Placeholder
            </Button>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowPlaceholderDialog(false)}>
                Cancel
              </Button>
              <Button onClick={savePlaceholder} disabled={!placeholderPreview || savingPlaceholder}>
                {savingPlaceholder ? "Saving..." : "Save Placeholder"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
