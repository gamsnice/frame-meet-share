import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLinkedInSessionId, clearLinkedInSession } from "@/lib/linkedin-session";

interface LinkedInStatus {
  connected: boolean;
  name?: string;
  expires_at?: string;
}

interface UseLinkedInAuthReturn {
  isConnected: boolean;
  linkedInName: string | null;
  isLoading: boolean;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

export function useLinkedInAuth(): UseLinkedInAuthReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [linkedInName, setLinkedInName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  const checkStatus = useCallback(async () => {
    try {
      const sessionId = getLinkedInSessionId();
      const { data, error } = await supabase.functions.invoke("linkedin-status", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: null,
      });

      // Use fetch directly since invoke doesn't support query params well for GET
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/linkedin-status?session_id=${encodeURIComponent(sessionId)}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );

      if (response.ok) {
        const status: LinkedInStatus = await response.json();
        setIsConnected(status.connected);
        setLinkedInName(status.name || null);
      } else {
        setIsConnected(false);
        setLinkedInName(null);
      }
    } catch (error) {
      console.error("Failed to check LinkedIn status:", error);
      setIsConnected(false);
      setLinkedInName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    try {
      const sessionId = getLinkedInSessionId();
      // Redirect URI should point to our callback page
      const redirectUri = `${window.location.origin}/linkedin/callback`;

      const { data, error } = await supabase.functions.invoke("linkedin-auth-init", {
        body: {
          session_id: sessionId,
          redirect_uri: redirectUri,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (!data?.auth_url) {
        throw new Error("No authorization URL received");
      }

      // Open popup for OAuth
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;

      const popup = window.open(
        data.auth_url,
        "linkedin-oauth",
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );

      // Listen for callback message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === "linkedin-oauth-callback") {
          window.removeEventListener("message", handleMessage);
          
          if (event.data.success) {
            setIsConnected(true);
            setLinkedInName(event.data.name || "LinkedIn User");
          } else {
            console.error("LinkedIn OAuth failed:", event.data.error);
          }
          
          setIsConnecting(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Poll for popup close (in case user closes without completing)
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          setIsConnecting(false);
          // Check status in case OAuth completed
          checkStatus();
        }
      }, 500);
    } catch (error) {
      console.error("Failed to initiate LinkedIn OAuth:", error);
      setIsConnecting(false);
    }
  }, [checkStatus]);

  const disconnect = useCallback(async () => {
    try {
      const sessionId = getLinkedInSessionId();
      
      await supabase.functions.invoke("linkedin-disconnect", {
        body: { session_id: sessionId },
      });

      setIsConnected(false);
      setLinkedInName(null);
    } catch (error) {
      console.error("Failed to disconnect LinkedIn:", error);
    }
  }, []);

  // Check status on mount
  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isConnected,
    linkedInName,
    isLoading,
    isConnecting,
    connect,
    disconnect,
    checkStatus,
  };
}
