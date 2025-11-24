import { supabase } from "@/lib/supabase";

export async function trackEvent(
  eventId: string,
  templateId: string | null,
  eventType: "view" | "upload" | "download" | "caption_copy"
) {
  try {
    const today = new Date().toISOString().split("T")[0];
    const updateField = `${eventType}s_count`;

    // Try to find existing record
    const { data: existing } = await supabase
      .from("event_stats_daily")
      .select("*")
      .eq("event_id", eventId)
      .eq("template_id", templateId)
      .eq("date", today)
      .maybeSingle();

    if (existing) {
      // Update existing
      const currentValue = (existing as any)[updateField] || 0;
      await supabase
        .from("event_stats_daily")
        .update({ [updateField]: currentValue + 1 })
        .eq("id", existing.id);
    } else {
      // Insert new
      await supabase.from("event_stats_daily").insert([
        {
          event_id: eventId,
          template_id: templateId,
          date: today,
          [updateField]: 1,
        },
      ]);
    }
  } catch (error) {
    console.error("Failed to track event:", error);
  }
}
