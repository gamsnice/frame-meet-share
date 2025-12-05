import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import { toast } from "sonner";
import type { Template, Caption } from "@/types";

interface CaptionsDialogProps {
  template: Template | null;
  onClose: () => void;
}

export function CaptionsDialog({ template, onClose }: CaptionsDialogProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [newCaption, setNewCaption] = useState("");

  useEffect(() => {
    if (template) {
      loadCaptions(template.id);
    }
  }, [template]);

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

  const addCaption = async () => {
    if (!newCaption.trim() || !template) return;

    try {
      const { error } = await supabase
        .from("template_captions")
        .insert([{ template_id: template.id, caption_text: newCaption }]);

      if (error) throw error;
      toast.success("Caption added!");
      setNewCaption("");
      loadCaptions(template.id);
    } catch (error: any) {
      toast.error("Failed to add caption");
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      const { error } = await supabase.from("template_captions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Caption deleted");
      if (template) loadCaptions(template.id);
    } catch (error: any) {
      toast.error("Failed to delete caption");
    }
  };

  return (
    <Dialog open={!!template} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Captions - {template?.name}</DialogTitle>
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
  );
}
