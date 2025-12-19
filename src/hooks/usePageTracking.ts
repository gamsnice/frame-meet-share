import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook to track page views for analytics
 * @param pagePath - The path of the page being tracked
 */
export function usePageTracking(pagePath: string = "/") {
  useEffect(() => {
    const trackPageView = async () => {
      try {
        // Type assertion needed until Supabase types are regenerated to include page_views table
        const { error } = await (supabase as any).from("page_views").insert({
          page_path: pagePath,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });
      } catch (error) {
        // Silently fail - don't disrupt user experience
        console.error("Failed to track page view:", error);
      }
    };
    
    trackPageView();
  }, [pagePath]);
}
