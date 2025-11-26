import { supabase } from "@/lib/supabase";

export async function trackEvent(
  eventId: string,
  templateId: string | null,
  eventType: "view" | "upload" | "download" | "caption_copy"
) {
  try {
    await supabase.rpc('increment_event_stat', {
      p_event_id: eventId,
      p_template_id: templateId,
      p_stat_type: eventType
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
