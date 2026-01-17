import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle, AlertTriangle } from "lucide-react";

// User-friendly error messages for common OAuth errors
function getOAuthErrorMessage(error: string, description?: string): { title: string; message: string } {
  const errorLower = error.toLowerCase();
  const descLower = description?.toLowerCase() || "";
  
  if (errorLower.includes("redirect_uri") || descLower.includes("redirect_uri") || descLower.includes("does not match")) {
    return {
      title: "Configuration Error",
      message: "The app's redirect URL is not configured correctly in LinkedIn. Please contact the event organizer.",
    };
  }
  
  if (errorLower === "access_denied" || errorLower === "user_cancelled_authorize") {
    return {
      title: "Authorization Cancelled",
      message: "You cancelled the LinkedIn authorization.",
    };
  }
  
  if (errorLower === "unauthorized_client") {
    return {
      title: "App Not Authorized",
      message: "This app is not authorized to connect with LinkedIn. Please contact the event organizer.",
    };
  }
  
  if (errorLower === "invalid_scope") {
    return {
      title: "Invalid Permissions",
      message: "The app requested invalid LinkedIn permissions. Please contact the event organizer.",
    };
  }
  
  if (errorLower === "server_error" || errorLower === "temporarily_unavailable") {
    return {
      title: "LinkedIn Unavailable",
      message: "LinkedIn is temporarily unavailable. Please try again later.",
    };
  }
  
  return {
    title: "Connection Failed",
    message: description || "Failed to connect to LinkedIn. Please try again.",
  };
}

// Check if we're in a popup (has opener) or redirect flow (no opener)
function isPopupFlow(): boolean {
  try {
    return !!window.opener && window.opener !== window;
  } catch {
    // Cross-origin access to opener will throw
    return false;
  }
}

// Redirect back to original page with parameters (for mobile redirect flow)
function redirectToReturnUrl(params: Record<string, string>) {
  const returnUrl = sessionStorage.getItem("linkedin_return_url");
  sessionStorage.removeItem("linkedin_return_url");

  if (returnUrl) {
    try {
      const url = new URL(returnUrl);
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.set(key, value);
      });
      window.location.href = url.toString();
    } catch {
      // Invalid URL, fallback to root
      const fallbackUrl = new URL(window.location.origin);
      Object.entries(params).forEach(([key, value]) => {
        fallbackUrl.searchParams.set(key, value);
      });
      window.location.href = fallbackUrl.toString();
    }
  } else {
    // No return URL stored, redirect to root with params
    const fallbackUrl = new URL(window.location.origin);
    Object.entries(params).forEach(([key, value]) => {
      fallbackUrl.searchParams.set(key, value);
    });
    window.location.href = fallbackUrl.toString();
  }
}

export default function LinkedInCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error" | "cancelled">("loading");
  const [message, setMessage] = useState("Connecting to LinkedIn...");
  const [errorTitle, setErrorTitle] = useState("Connection Failed");

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      const inPopup = isPopupFlow();

      if (error) {
        const { title, message } = getOAuthErrorMessage(error, errorDescription || undefined);
        setErrorTitle(title);
        setMessage(message);
        setStatus(error === "access_denied" || error === "user_cancelled_authorize" ? "cancelled" : "error");
        
        if (inPopup) {
          // Popup flow: notify opener
          window.opener.postMessage(
            { 
              type: "linkedin-oauth-callback", 
              success: false, 
              error: message,
              errorCode: error,
            },
            window.location.origin
          );
          setTimeout(() => window.close(), 3000);
        } else {
          // Redirect flow: go back to original page with error
          setTimeout(() => {
            redirectToReturnUrl({ linkedin_error: message });
          }, 2000);
        }
        return;
      }

      if (!code || !state) {
        const errorMsg = "The authorization response is incomplete. Please try again.";
        setErrorTitle("Missing Parameters");
        setMessage(errorMsg);
        setStatus("error");
        
        if (inPopup) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: errorMsg },
            window.location.origin
          );
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => {
            redirectToReturnUrl({ linkedin_error: errorMsg });
          }, 2000);
        }
        return;
      }

      try {
        const { data, error: callbackError } = await supabase.functions.invoke(
          "linkedin-auth-callback",
          {
            body: { code, state },
          }
        );

        if (callbackError || data?.error) {
          throw new Error(data?.error || callbackError?.message || "Failed to complete authorization");
        }

        setStatus("success");
        setMessage(`Connected as ${data.name || "LinkedIn User"}`);

        if (inPopup) {
          // Popup flow: notify opener and close
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: true, name: data.name },
            window.location.origin
          );
          setTimeout(() => window.close(), 1500);
        } else {
          // Redirect flow: go back to original page with success
          setTimeout(() => {
            redirectToReturnUrl({
              linkedin_connected: "true",
              linkedin_name: data.name || "LinkedIn User",
            });
          }, 1500);
        }
      } catch (err) {
        console.error("LinkedIn callback error:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to connect to LinkedIn";
        setErrorTitle("Connection Failed");
        setMessage(errorMsg);
        setStatus("error");
        
        if (inPopup) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: errorMsg },
            window.location.origin
          );
          setTimeout(() => window.close(), 3000);
        } else {
          setTimeout(() => {
            redirectToReturnUrl({ linkedin_error: errorMsg });
          }, 2000);
        }
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8 max-w-md">
        {status === "loading" && (
          <>
            <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
            <p className="text-muted-foreground">{message}</p>
          </>
        )}
        
        {status === "success" && (
          <>
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <p className="text-foreground font-medium">{message}</p>
            <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
          </>
        )}
        
        {status === "cancelled" && (
          <>
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-foreground font-medium">{errorTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
            <p className="text-xs text-muted-foreground mt-4">Redirecting...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-medium">{errorTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
            <p className="text-xs text-muted-foreground mt-4">Redirecting...</p>
          </>
        )}
      </div>
    </div>
  );
}
