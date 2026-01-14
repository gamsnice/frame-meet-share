import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import type { Template, Caption } from "@/types";

interface CaptionsDialogProps {
  template: Template | null;
  onClose: () => void;
}

export function CaptionsDialog({ template, onClose }: CaptionsDialogProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [newCaption, setNewCaption] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    if (template) {
      loadCaptions(template.id);
      setSelectedIndex(0);
      setIsAdding(false);
    }
  }, [template]);

  const loadCaptions = async (templateId: string) => {
    try {
      const { data, error } = await supabase.from("template_captions").select("*").eq("template_id", templateId);

      if (error) throw error;
      setCaptions(data || []);
      // If no captions exist, show add form
      if (!data || data.length === 0) {
        setIsAdding(true);
      }
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
      setIsAdding(false);
      await loadCaptions(template.id);
      // Select the newly added caption (will be last)
      setSelectedIndex(captions.length);
    } catch (error: any) {
      toast.error("Failed to add caption");
    }
  };

  const deleteCaption = async (id: string) => {
    try {
      const { error } = await supabase.from("template_captions").delete().eq("id", id);
      if (error) throw error;
      toast.success("Caption deleted");
      if (template) {
        await loadCaptions(template.id);
        // Adjust selected index if needed
        if (selectedIndex >= captions.length - 1) {
          setSelectedIndex(Math.max(0, captions.length - 2));
        }
      }
    } catch (error: any) {
      toast.error("Failed to delete caption");
    }
  };

  const selectedCaption = captions[selectedIndex];

  return (
    <Dialog open={!!template} onOpenChange={() => onClose()}>
      <DialogContent className="max-h-[85vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Captions - {template?.name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Caption Pills */}
          {captions.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {captions.map((caption, index) => (
                <button
                  key={caption.id}
                  onClick={() => {
                    setSelectedIndex(index);
                    setIsAdding(false);
                  }}
                  className={cn(
                    "px-3 py-1.5 text-xs rounded-full border transition-all font-medium",
                    "hover:border-primary/50",
                    index === selectedIndex && !isAdding
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border text-muted-foreground"
                  )}
                >
                  Caption {index + 1}
                </button>
              ))}
              <button
                onClick={() => setIsAdding(true)}
                className={cn(
                  "px-3 py-1.5 text-xs rounded-full border transition-all font-medium flex items-center gap-1",
                  "hover:border-primary/50",
                  isAdding
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-dashed border-border text-muted-foreground"
                )}
              >
                <Plus className="h-3 w-3" />
                Add
              </button>
            </div>
          )}

          {/* Add New Caption Form */}
          {isAdding && (
            <div className="space-y-3">
              <Textarea
                value={newCaption}
                onChange={(e) => setNewCaption(e.target.value)}
                placeholder="Add a suggested caption..."
                rows={4}
                className="resize-none"
              />
              <div className="flex gap-2">
                <Button onClick={addCaption} disabled={!newCaption.trim()} className="flex-1">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Caption
                </Button>
                {captions.length > 0 && (
                  <Button variant="outline" onClick={() => setIsAdding(false)}>
                    Cancel
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Selected Caption Display */}
          {!isAdding && selectedCaption && (
            <Card className="p-4 flex-1 overflow-auto">
              <div className="flex justify-between items-start gap-3">
                <p className="text-sm flex-1 whitespace-pre-wrap leading-relaxed">
                  {selectedCaption.caption_text}
                </p>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive hover:bg-destructive/10 flex-shrink-0"
                  onClick={() => deleteCaption(selectedCaption.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </Card>
          )}

          {/* Empty State */}
          {captions.length === 0 && !isAdding && (
            <div className="text-center py-8 text-muted-foreground">
              <p className="text-sm">No captions yet</p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={() => setIsAdding(true)}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add First Caption
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
