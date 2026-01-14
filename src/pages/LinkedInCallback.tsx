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

      if (error) {
        const { title, message } = getOAuthErrorMessage(error, errorDescription || undefined);
        setErrorTitle(title);
        setMessage(message);
        setStatus(error === "access_denied" || error === "user_cancelled_authorize" ? "cancelled" : "error");
        
        // Notify opener window with error details
        if (window.opener) {
          window.opener.postMessage(
            { 
              type: "linkedin-oauth-callback", 
              success: false, 
              error: message,
              errorCode: error,
            },
            window.location.origin
          );
        }
        
        setTimeout(() => window.close(), 3000);
        return;
      }

      if (!code || !state) {
        setErrorTitle("Missing Parameters");
        setMessage("The authorization response is incomplete. Please try again.");
        setStatus("error");
        
        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: "Missing authorization parameters" },
            window.location.origin
          );
        }
        
        setTimeout(() => window.close(), 3000);
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

        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: true, name: data.name },
            window.location.origin
          );
        }

        setTimeout(() => window.close(), 1500);
      } catch (err) {
        console.error("LinkedIn callback error:", err);
        const errorMsg = err instanceof Error ? err.message : "Failed to connect to LinkedIn";
        setErrorTitle("Connection Failed");
        setMessage(errorMsg);
        setStatus("error");
        
        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: errorMsg },
            window.location.origin
          );
        }
        
        setTimeout(() => window.close(), 3000);
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
            <p className="text-sm text-muted-foreground mt-2">This window will close automatically...</p>
          </>
        )}
        
        {status === "cancelled" && (
          <>
            <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
            <p className="text-foreground font-medium">{errorTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
            <p className="text-xs text-muted-foreground mt-4">This window will close automatically...</p>
          </>
        )}
        
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-medium">{errorTitle}</p>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
            <p className="text-xs text-muted-foreground mt-4">This window will close automatically...</p>
          </>
        )}
      </div>
    </div>
  );
}
