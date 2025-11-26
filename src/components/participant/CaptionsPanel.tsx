import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface Caption {
  id: string;
  caption_text: string;
}

interface CaptionsPanelProps {
  templateId: string;
  eventId: string;
}

export default function CaptionsPanel({ templateId, eventId }: CaptionsPanelProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);

  useEffect(() => {
    loadCaptions();
  }, [templateId]);

  const loadCaptions = async () => {
    try {
      const { data, error } = await supabase
        .from("template_captions")
        .select("*")
        .eq("template_id", templateId);

      if (error) throw error;
      setCaptions(data || []);
    } catch (error: any) {
      console.error("Failed to load captions:", error);
    }
  };

  const copyCaption = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied to clipboard!");
      await trackEvent(eventId, templateId, "caption_copy");
    } catch (error) {
      toast.error("Failed to copy caption");
    }
  };

  if (captions.length === 0) {
    return null;
  }

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Need some caption ideas?</h2>
      <div className="space-y-3">
        {captions.map((caption) => (
          <div key={caption.id} className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <p className="flex-1 text-sm whitespace-pre-wrap">{caption.caption_text}</p>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => copyCaption(caption.caption_text)}
              className="shrink-0"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}
