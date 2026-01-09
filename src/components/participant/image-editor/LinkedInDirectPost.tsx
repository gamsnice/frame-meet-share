import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, ExternalLink, AlertCircle, Send } from "lucide-react";
import { LinkedInConnectCard } from "./LinkedInConnectCard";
import { CaptionSelector } from "./CaptionSelector";
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
    connect,
    disconnect,
    checkStatus,
  } = useLinkedInAuth();

  const { post, isPosting, postError, postUrl } = useLinkedInPost();

  // Auto-select first caption if available
  const [selectedCaption, setSelectedCaption] = useState<string>(() => {
    return captions.length > 0 ? captions[0].caption_text : "";
  });

  // Update selected caption when captions change
  useEffect(() => {
    if (captions.length > 0 && !selectedCaption) {
      setSelectedCaption(captions[0].caption_text);
    }
  }, [captions, selectedCaption]);

  const handlePost = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        console.error("Failed to generate image");
        return;
      }

      const result = await post(blob, selectedCaption);
      
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

  return (
    <div className={cn("space-y-4", className)}>
      {/* Connection Status */}
      <LinkedInConnectCard
        isConnected={isConnected}
        linkedInName={linkedInName}
        isLoading={isAuthLoading}
        isConnecting={isConnecting}
        onConnect={connect}
        onDisconnect={disconnect}
      />

      {/* Caption Selection (only when connected) */}
      {isConnected && captions.length > 1 && (
        <CaptionSelector
          captions={captions}
          selectedCaption={selectedCaption}
          onSelectCaption={setSelectedCaption}
        />
      )}

      {/* Error Message */}
      {postError && (
        <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertCircle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
          <p className="text-sm text-destructive">{postError}</p>
        </div>
      )}

      {/* Post Button (only when connected) */}
      {isConnected && (
        <Button
          onClick={handlePost}
          disabled={isPosting}
          className="w-full min-h-[44px] bg-[#0077B5] hover:bg-[#005885] text-white"
        >
          {isPosting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Posting to LinkedIn...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post to LinkedIn
            </>
          )}
        </Button>
      )}

      {/* Helper text */}
      {!isConnected && !isAuthLoading && (
        <p className="text-xs text-muted-foreground text-center">
          Connect once to post directly. Your connection stays active for 60 days.
        </p>
      )}
    </div>
  );
}
