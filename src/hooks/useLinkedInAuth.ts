import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLinkedInSessionId, clearLinkedInSession } from "@/lib/linkedin-session";
import { toast } from "@/hooks/use-toast";

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
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  checkStatus: () => Promise<void>;
  clearError: () => void;
}

// Detect mobile devices for redirect-based OAuth flow
function isMobileDevice(): boolean {
  return /iPhone|iPad|iPod|Android|webOS|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

// User-friendly error messages for common OAuth errors
function getOAuthErrorMessage(error: string, description?: string): string {
  const errorLower = error.toLowerCase();
  const descLower = description?.toLowerCase() || "";
  
  if (errorLower.includes("redirect_uri") || descLower.includes("redirect_uri") || descLower.includes("does not match")) {
    return "LinkedIn connection failed: The app's redirect URL is not configured correctly. Please contact the event organizer.";
  }
  
  if (errorLower === "access_denied" || errorLower === "user_cancelled_authorize") {
    return "You cancelled the LinkedIn authorization.";
  }
  
  if (errorLower === "unauthorized_client") {
    return "LinkedIn connection failed: The app is not authorized. Please contact the event organizer.";
  }
  
  if (errorLower === "invalid_scope") {
    return "LinkedIn connection failed: Invalid permissions requested. Please contact the event organizer.";
  }
  
  if (errorLower === "server_error" || errorLower === "temporarily_unavailable") {
    return "LinkedIn is temporarily unavailable. Please try again later.";
  }
  
  // Return the description if available, otherwise a generic message
  return description || "Failed to connect to LinkedIn. Please try again.";
}

export function useLinkedInAuth(): UseLinkedInAuthReturn {
  const [isConnected, setIsConnected] = useState(false);
  const [linkedInName, setLinkedInName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const checkStatus = useCallback(async () => {
    try {
      const sessionId = getLinkedInSessionId();

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
    } catch (err) {
      console.error("Failed to check LinkedIn status:", err);
      setIsConnected(false);
      setLinkedInName(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Handle URL parameters from mobile redirect flow
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const connected = params.get("linkedin_connected");
    const linkedInNameParam = params.get("linkedin_name");
    const errorParam = params.get("linkedin_error");

    if (connected === "true") {
      setIsConnected(true);
      setLinkedInName(linkedInNameParam || "LinkedIn User");
      setIsLoading(false);
      toast({
        title: "LinkedIn Connected",
        description: `Signed in as ${linkedInNameParam || "LinkedIn User"}`,
      });

      // Clean URL parameters
      params.delete("linkedin_connected");
      params.delete("linkedin_name");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    } else if (errorParam) {
      setError(errorParam);
      setIsLoading(false);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorParam,
      });

      // Clean URL parameters
      params.delete("linkedin_error");
      const newUrl = params.toString()
        ? `${window.location.pathname}?${params}`
        : window.location.pathname;
      window.history.replaceState({}, "", newUrl);
    }
  }, []);

  const connect = useCallback(async () => {
    setIsConnecting(true);
    setError(null);

    const isMobile = isMobileDevice();

    // On desktop, open popup immediately (before async call) to avoid popup blockers
    let popup: Window | null = null;
    if (!isMobile) {
      const width = 600;
      const height = 700;
      const left = window.screenX + (window.outerWidth - width) / 2;
      const top = window.screenY + (window.outerHeight - height) / 2;
      popup = window.open(
        "about:blank",
        "linkedin-oauth",
        `width=${width},height=${height},left=${left},top=${top},popup=1`
      );
    }
    
    try {
      const sessionId = getLinkedInSessionId();
      const redirectUri = `${window.location.origin}/linkedin/callback`;

      const { data, error: invokeError } = await supabase.functions.invoke("linkedin-auth-init", {
        body: {
          session_id: sessionId,
          redirect_uri: redirectUri,
        },
      });

      if (invokeError) {
        throw new Error(invokeError.message);
      }

      if (!data?.auth_url) {
        throw new Error("No authorization URL received");
      }

      if (isMobile) {
        // Mobile: Store return URL and redirect in same window
        sessionStorage.setItem("linkedin_return_url", window.location.href);
        window.location.href = data.auth_url;
        return; // Page will navigate away
      }

      // Desktop: Navigate the pre-opened popup to the auth URL
      if (popup && !popup.closed) {
        popup.location.href = data.auth_url;
      } else {
        throw new Error("Popup was blocked. Please allow popups for this site.");
      }

      // Listen for callback message from popup
      const handleMessage = async (event: MessageEvent) => {
        if (event.origin !== window.location.origin) return;
        
        if (event.data?.type === "linkedin-oauth-callback") {
          window.removeEventListener("message", handleMessage);
          
          if (event.data.success) {
            setIsConnected(true);
            setLinkedInName(event.data.name || "LinkedIn User");
            setError(null);
            toast({
              title: "LinkedIn Connected",
              description: `Signed in as ${event.data.name || "LinkedIn User"}`,
            });
          } else {
            const errorMsg = getOAuthErrorMessage(
              event.data.errorCode || event.data.error || "unknown",
              event.data.error
            );
            setError(errorMsg);
            toast({
              variant: "destructive",
              title: "Connection Failed",
              description: errorMsg,
            });
          }
          
          setIsConnecting(false);
        }
      };

      window.addEventListener("message", handleMessage);

      // Poll for popup close
      const pollTimer = setInterval(() => {
        if (popup?.closed) {
          clearInterval(pollTimer);
          window.removeEventListener("message", handleMessage);
          setIsConnecting(false);
          checkStatus();
        }
      }, 500);
    } catch (err) {
      console.error("Failed to initiate LinkedIn OAuth:", err);
      const errorMsg = err instanceof Error ? err.message : "Failed to start LinkedIn connection. Please try again.";
      setError(errorMsg);
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: errorMsg,
      });
      setIsConnecting(false);
      // Close popup if it was opened
      if (popup && !popup.closed) {
        popup.close();
      }
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
      setError(null);
      toast({
        title: "LinkedIn Disconnected",
        description: "Your LinkedIn account has been disconnected.",
      });
    } catch (err) {
      console.error("Failed to disconnect LinkedIn:", err);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to disconnect LinkedIn. Please try again.",
      });
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    isConnected,
    linkedInName,
    isLoading,
    isConnecting,
    error,
    connect,
    disconnect,
    checkStatus,
    clearError,
  };
}
