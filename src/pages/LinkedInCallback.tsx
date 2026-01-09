import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

export default function LinkedInCallback() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Connecting to LinkedIn...");

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      const state = urlParams.get("state");
      const error = urlParams.get("error");
      const errorDescription = urlParams.get("error_description");

      if (error) {
        setStatus("error");
        setMessage(errorDescription || "LinkedIn authorization was denied");
        
        // Notify opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: errorDescription || error },
            window.location.origin
          );
        }
        
        // Auto-close after delay
        setTimeout(() => window.close(), 2000);
        return;
      }

      if (!code || !state) {
        setStatus("error");
        setMessage("Missing authorization parameters");
        setTimeout(() => window.close(), 2000);
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

        // Notify opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: true, name: data.name },
            window.location.origin
          );
        }

        // Auto-close after delay
        setTimeout(() => window.close(), 1500);
      } catch (err) {
        console.error("LinkedIn callback error:", err);
        setStatus("error");
        setMessage(err instanceof Error ? err.message : "Failed to connect to LinkedIn");
        
        // Notify opener window
        if (window.opener) {
          window.opener.postMessage(
            { type: "linkedin-oauth-callback", success: false, error: message },
            window.location.origin
          );
        }
        
        setTimeout(() => window.close(), 2000);
      }
    };

    handleCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center p-8">
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
        
        {status === "error" && (
          <>
            <XCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <p className="text-foreground font-medium">Connection Failed</p>
            <p className="text-sm text-muted-foreground mt-2">{message}</p>
          </>
        )}
      </div>
    </div>
  );
}
