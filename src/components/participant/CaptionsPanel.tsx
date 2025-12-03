import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Copy, ChevronDown, ChevronUp, Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { trackEvent } from "@/lib/analytics";

interface Caption {
  id: string;
  caption_text: string;
}

interface CaptionsPanelProps {
  templateId: string;
  eventId: string;
  isMobile?: boolean;
}

export default function CaptionsPanel({ templateId, eventId, isMobile = false }: CaptionsPanelProps) {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [isExpanded, setIsExpanded] = useState(!isMobile);

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

  if (isMobile) {
    return (
      <Card className="p-3">
        <button 
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Caption Ideas</span>
            <span className="text-[10px] text-muted-foreground">({captions.length})</span>
          </div>
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        
        {isExpanded && (
          <div className="mt-3 space-y-2">
            {captions.map((caption) => (
              <div key={caption.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                <p className="flex-1 text-xs whitespace-pre-wrap leading-relaxed">{caption.caption_text}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyCaption(caption.caption_text)}
                  className="shrink-0 h-7 w-7 p-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    );
  }

  // Desktop Layout
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
