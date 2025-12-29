import { supabase } from "@/lib/supabase";

export async function trackEvent(
  eventId: string,
  templateId: string | null,
  eventType: "view" | "upload" | "download" | "caption_copy"
) {
  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentQuarter = Math.floor(now.getMinutes() / 15); // 0, 1, 2, or 3
    
    // Track daily stats (existing)
    await supabase.rpc('increment_event_stat', {
      p_event_id: eventId,
      p_template_id: templateId,
      p_stat_type: eventType
    });

    // Track hourly stats (legacy - kept for backward compatibility)
    await supabase.rpc('increment_event_stat_hourly', {
      p_event_id: eventId,
      p_template_id: templateId,
      p_stat_type: eventType,
      p_hour: currentHour
    });

    // Track quarter-hourly stats (15-minute intervals)
    await supabase.rpc('increment_event_stat_quarter_hourly', {
      p_event_id: eventId,
      p_template_id: templateId,
      p_stat_type: eventType,
      p_hour: currentHour,
      p_quarter: currentQuarter
    });
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}

export async function trackDownloadWithLimit(
  eventId: string,
  templateId: string | null
): Promise<{ success: boolean; limitReached?: boolean; message?: string }> {
  try {
    // First, check and increment the download counter via RPC
    const { data, error } = await supabase.rpc('increment_user_download', {
      p_event_id: eventId
    });

    if (error) {
      console.error("Failed to track download:", error);
      return { success: false, message: "Failed to track download" };
    }

    // Parse the response - it comes back as jsonb
    const result = data as { success?: boolean; limit_reached?: boolean; message?: string } | null;

    // Check if limit was reached
    if (result && !result.success) {
      return { 
        success: false, 
        limitReached: result.limit_reached || false,
        message: result.message || "Download failed" 
      };
    }

    // If successful, also track in analytics
    await trackEvent(eventId, templateId, "download");
    
    return { success: true };
  } catch (error) {
    console.error("Failed to track download with limit:", error);
    return { success: false, message: "An error occurred" };
  }
}
