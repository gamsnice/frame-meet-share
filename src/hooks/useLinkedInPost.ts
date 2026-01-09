import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLinkedInSessionId } from "@/lib/linkedin-session";

interface PostResult {
  success: boolean;
  post_url?: string;
  error?: string;
  reconnect?: boolean;
}

interface UseLinkedInPostReturn {
  post: (imageBlob: Blob, caption: string) => Promise<PostResult>;
  isPosting: boolean;
  postError: string | null;
  postUrl: string | null;
}

export function useLinkedInPost(): UseLinkedInPostReturn {
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postUrl, setPostUrl] = useState<string | null>(null);

  const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        resolve(result);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const post = useCallback(async (imageBlob: Blob, caption: string): Promise<PostResult> => {
    setIsPosting(true);
    setPostError(null);
    setPostUrl(null);

    try {
      const sessionId = getLinkedInSessionId();
      const imageBase64 = await blobToBase64(imageBlob);

      const { data, error } = await supabase.functions.invoke("linkedin-post", {
        body: {
          session_id: sessionId,
          image_base64: imageBase64,
          caption: caption,
        },
      });

      if (error) {
        const errorMessage = error.message || "Failed to post to LinkedIn";
        setPostError(errorMessage);
        return { success: false, error: errorMessage };
      }

      if (data?.error) {
        setPostError(data.error);
        return { success: false, error: data.error, reconnect: data.reconnect };
      }

      setPostUrl(data.post_url);
      return { success: true, post_url: data.post_url };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to post to LinkedIn";
      setPostError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsPosting(false);
    }
  }, []);

  return {
    post,
    isPosting,
    postError,
    postUrl,
  };
}
