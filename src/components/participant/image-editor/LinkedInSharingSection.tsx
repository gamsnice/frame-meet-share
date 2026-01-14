import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Linkedin, Copy, Check, ExternalLink, Image, MessageSquare } from "lucide-react";
import { cn } from "@/lib/utils";
import { LinkedInConnectCard } from "./LinkedInConnectCard";
import { useLinkedInAuth } from "@/hooks/useLinkedInAuth";
import { useLinkedInPost } from "@/hooks/useLinkedInPost";
import type { Caption } from "@/types";

interface LinkedInSharingSectionProps {
  captions: Caption[];
  generateImageBlob: () => Promise<Blob | null>;
  onShareToLinkedIn: () => Promise<void>;
  isLoading: boolean;
  isMobile?: boolean;
}

const MAX_CAPTION_LENGTH = 3000;

export function LinkedInSharingSection({
  captions,
  generateImageBlob,
  onShareToLinkedIn,
  isLoading,
  isMobile = false,
}: LinkedInSharingSectionProps) {
  const [activeTab, setActiveTab] = useState<"direct" | "manual">("direct");
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const [editedCaption, setEditedCaption] = useState("");
  const [captionCopied, setCaptionCopied] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

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

  // Initialize caption from selected index
  useEffect(() => {
    if (captions.length > 0) {
      setEditedCaption(captions[selectedCaptionIndex]?.caption_text || "");
    }
  }, [captions, selectedCaptionIndex]);

  // Reset copied state when caption changes
  useEffect(() => {
    setCaptionCopied(false);
  }, [editedCaption, selectedCaptionIndex]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedCaption]);

  const handlePost = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob) {
        console.error("Failed to generate image");
        return;
      }

      const result = await post(blob, editedCaption);
      
      if (result.success) {
        // Success is handled by postUrl state
      } else if (result.reconnect) {
        await checkStatus();
      }
    } catch (error) {
      console.error("Failed to post to LinkedIn:", error);
    }
  };

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(editedCaption);
    setCaptionCopied(true);
  };

  const handleManualShare = async () => {
    await onShareToLinkedIn();
  };

  const charactersRemaining = MAX_CAPTION_LENGTH - editedCaption.length;
  const isOverLimit = charactersRemaining < 0;
  const isNearLimit = charactersRemaining < 200 && charactersRemaining >= 0;

  // Detect platform for keyboard shortcut
  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);
  const shortcutKey = isMac ? "⌘V" : "Ctrl+V";

  // Caption Pills Component
  const CaptionPills = () => {
    if (captions.length <= 1) return null;
    
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {captions.map((c, index) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaptionIndex(index)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-all font-medium",
              "hover:border-foreground/30",
              index === selectedCaptionIndex
                ? "border-[#0077B5] bg-[#0077B5]/10 text-[#0077B5]"
                : "border-border text-muted-foreground"
            )}
          >
            Caption {index + 1}
          </button>
        ))}
      </div>
    );
  };

  // Success State
  if (postUrl) {
    return (
      <div className="rounded-xl border border-[#0077B5]/20 bg-gradient-to-b from-card to-card/50 p-4 mt-4">
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
            <Check className="h-6 w-6 text-green-500" />
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
    <div className="rounded-xl border border-[#0077B5]/20 bg-gradient-to-b from-card to-card/50 p-4 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center">
          <Linkedin className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold text-foreground">Share to LinkedIn</span>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab("direct")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
            activeTab === "direct"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Direct Post
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex-1 py-2 px-3 text-sm font-medium rounded-md transition-all",
            activeTab === "manual"
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Manual Share
        </button>
      </div>

      {/* Direct Post Tab */}
      {activeTab === "direct" && (
        <div className="space-y-4">
          {!isConnected ? (
            <>
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
            </>
          ) : (
            <>
              {/* Connected Header */}
              <div className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-[#0077B5]/10 flex items-center justify-center">
                  <Check className="h-3.5 w-3.5 text-[#0077B5]" />
                </div>
                <span className="text-muted-foreground">
                  Connected as <span className="text-foreground font-medium">{linkedInName}</span>
                </span>
              </div>

              {/* Error Message */}
              {postError && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive">{postError}</p>
                </div>
              )}

              {/* Caption Pills */}
              <CaptionPills />

              {/* Caption Textarea */}
              <div className="rounded-lg border border-border bg-card p-3">
                <Textarea
                  ref={textareaRef}
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  placeholder="Write something about your event visual..."
                  className={cn(
                    "min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm"
                  )}
                  disabled={isPosting}
                />
                <div className="flex justify-end mt-2">
                  <span
                    className={cn(
                      "text-xs",
                      isOverLimit && "text-destructive font-medium",
                      isNearLimit && !isOverLimit && "text-amber-500",
                      !isNearLimit && !isOverLimit && "text-muted-foreground",
                    )}
                  >
                    {editedCaption.length}/{MAX_CAPTION_LENGTH}
                  </span>
                </div>
              </div>

              {/* Post Button */}
              <Button
                onClick={handlePost}
                disabled={isPosting || isOverLimit || !editedCaption}
                className="w-full min-h-[48px] bg-[#0077B5] hover:bg-[#005885] text-white font-medium"
              >
                {isPosting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Post to LinkedIn
                  </>
                )}
              </Button>

              {isOverLimit && (
                <p className="text-xs text-destructive text-center">
                  Caption exceeds LinkedIn's {MAX_CAPTION_LENGTH} character limit
                </p>
              )}

              {/* Disconnect option */}
              <button
                onClick={disconnect}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Disconnect LinkedIn
              </button>
            </>
          )}
        </div>
      )}

      {/* Manual Share Tab */}
      {activeTab === "manual" && (
        <div className="space-y-4">
          {/* Step 1 - Open LinkedIn */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-xs font-bold">
              1
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Copy image & open LinkedIn</p>
              <p className="text-xs text-muted-foreground mb-2">
                Image will be copied. Paste with <kbd className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono">{shortcutKey}</kbd>
              </p>
              <Button
                onClick={handleManualShare}
                disabled={isLoading}
                className="w-full min-h-[44px] bg-[#0077B5] hover:bg-[#005885] text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <ExternalLink className="h-4 w-4 mr-2" />
                )}
                Open LinkedIn to Share
              </Button>
            </div>
            <Image className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>

          {/* Step 2 - Caption */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-xs font-bold">
              2
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Add your caption</p>
              
              {captions.length > 0 ? (
                <div className="mt-2 space-y-2">
                  {/* Caption Pills */}
                  <CaptionPills />
                  
                  {/* Caption Preview */}
                  <div className="rounded-lg border border-border bg-card/50 p-3">
                    <p className="text-xs text-muted-foreground line-clamp-3 italic">
                      "{editedCaption.length > 150 ? editedCaption.substring(0, 150) + "..." : editedCaption}"
                    </p>
                  </div>
                  
                  {/* Copy Button */}
                  <Button 
                    size="sm" 
                    onClick={handleCopyCaption}
                    disabled={captionCopied || !editedCaption}
                    className={cn(
                      "w-full h-9 text-xs font-medium",
                      captionCopied 
                        ? "bg-green-600 hover:bg-green-600 text-white" 
                        : "bg-[#0077B5] hover:bg-[#005885] text-white"
                    )}
                  >
                    {captionCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5 mr-1.5" />
                        Copied! Paste in LinkedIn
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 mr-1.5" />
                        Copy Caption
                      </>
                    )}
                  </Button>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">Write something about your experience</p>
              )}
            </div>
            <MessageSquare className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>

          {/* Step 3 - Post */}
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-xs font-bold">
              3
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm">Click "Post" on LinkedIn</p>
              <p className="text-xs text-muted-foreground">Share with your network</p>
            </div>
            <Send className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
          </div>
        </div>
      )}
    </div>
  );
}
