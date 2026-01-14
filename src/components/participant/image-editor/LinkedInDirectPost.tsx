import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import { LinkedInConnectCard } from "./LinkedInConnectCard";
import { LinkedInPostPreview } from "./LinkedInPostPreview";
import { useLinkedInAuth } from "@/hooks/useLinkedInAuth";
import { useLinkedInPost } from "@/hooks/useLinkedInPost";
import { cn } from "@/lib/utils";
import type { Caption } from "@/types";

interface LinkedInDirectPostProps {
  captions: Caption[];
  generateImageBlob: () => Promise<Blob | null>;
  onSuccess?: () => void;
  className?: string;
}

export function LinkedInDirectPost({
  captions,
  generateImageBlob,
  onSuccess,
  className,
}: LinkedInDirectPostProps) {
  const {
    isConnected,
    linkedInName,
    isLoading: isAuthLoading,
    isConnecting,
    error: authError,
    connect,
    disconnect,
    checkStatus,
    clearError,
  } = useLinkedInAuth();

  const { post, isPosting, postError, postUrl } = useLinkedInPost();

  // Editable caption state
  const [editedCaption, setEditedCaption] = useState<string>("");
  
  // Image preview URL
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  // Initialize caption when connected or captions change
  useEffect(() => {
    if (isConnected && captions.length > 0 && !editedCaption) {
      setEditedCaption(captions[0].caption_text);
    }
  }, [isConnected, captions, editedCaption]);

  // Generate preview image when connected
  useEffect(() => {
    let mounted = true;
    let objectUrl: string | null = null;

    const generatePreview = async () => {
      if (isConnected && !previewUrl && !isGeneratingPreview) {
        setIsGeneratingPreview(true);
        try {
          const blob = await generateImageBlob();
          if (blob && mounted) {
            objectUrl = URL.createObjectURL(blob);
            setPreviewUrl(objectUrl);
          }
        } catch (error) {
          console.error("Failed to generate preview:", error);
        } finally {
          if (mounted) {
            setIsGeneratingPreview(false);
          }
        }
      }
    };

    generatePreview();

    return () => {
      mounted = false;
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [isConnected, generateImageBlob, previewUrl, isGeneratingPreview]);

  // Reset state when disconnected
  useEffect(() => {
    if (!isConnected) {
      setPreviewUrl(null);
      setEditedCaption("");
    }
  }, [isConnected]);

  const handlePost = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        console.error("Failed to generate image");
        return;
      }

      const result = await post(blob, editedCaption);
      
      if (result.success) {
        onSuccess?.();
      } else if (result.reconnect) {
        // Token expired, need to reconnect
        await checkStatus();
      }
    } catch (error) {
      console.error("Failed to post to LinkedIn:", error);
    }
  };

  // Success state
  if (postUrl) {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <ExternalLink className="h-6 w-6 text-green-500" />
          </div>
          <p className="font-medium text-foreground">Posted to LinkedIn!</p>
          <p className="text-sm text-muted-foreground mt-1">
            Your event visual is now live
          </p>
        </div>
        
        <Button
          variant="outline"
          className="w-full min-h-[44px]"
          onClick={() => window.open(postUrl, "_blank")}
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          View on LinkedIn
        </Button>
      </div>
    );
  }

  // Not connected - show connect card
  if (!isConnected) {
    return (
      <div className={cn("space-y-4", className)}>
        <LinkedInConnectCard
          isConnected={isConnected}
          linkedInName={linkedInName}
          isLoading={isAuthLoading}
          isConnecting={isConnecting}
          error={authError}
          onConnect={connect}
          onDisconnect={disconnect}
          onRetry={() => {
            clearError();
            connect();
          }}
        />

        {!isAuthLoading && (
          <p className="text-xs text-muted-foreground text-center">
            Connect once to post directly. Your connection stays active for 60 days.
          </p>
        )}
      </div>
    );
  }

  // Connected - show post preview
  return (
    <div className={cn("space-y-4", className)}>
      {/* Error Message */}
      {postError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <p className="text-sm text-destructive">{postError}</p>
        </div>
      )}

      <LinkedInPostPreview
        linkedInName={linkedInName}
        imagePreviewUrl={previewUrl}
        caption={editedCaption}
        onCaptionChange={setEditedCaption}
        onPost={handlePost}
        isPosting={isPosting}
        captions={captions}
      />

      {/* Disconnect option */}
      <button
        onClick={disconnect}
        className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
      >
        Connected as {linkedInName} · Disconnect
      </button>
    </div>
  );
}
