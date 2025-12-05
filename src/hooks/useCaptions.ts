import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { trackEvent } from "@/lib/analytics";
import type { Caption } from "@/types";

interface UseCaptionsProps {
  templateId: string;
  eventId?: string;
  isMobile?: boolean;
}

interface UseCaptionsReturn {
  captions: Caption[];
  captionsExpanded: boolean;
  setCaptionsExpanded: (expanded: boolean) => void;
  copyCaption: (text: string) => Promise<void>;
}

export function useCaptions({ templateId, eventId, isMobile = false }: UseCaptionsProps): UseCaptionsReturn {
  const [captions, setCaptions] = useState<Caption[]>([]);
  const [captionsExpanded, setCaptionsExpanded] = useState(!isMobile);

  useEffect(() => {
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
    loadCaptions();
  }, [templateId]);

  const copyCaption = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Caption copied to clipboard!");
      if (eventId) {
        await trackEvent(eventId, templateId, "caption_copy");
      }
    } catch (error) {
      toast.error("Failed to copy caption");
    }
  }, [eventId, templateId]);

  return {
    captions,
    captionsExpanded,
    setCaptionsExpanded,
    copyCaption,
  };
}
