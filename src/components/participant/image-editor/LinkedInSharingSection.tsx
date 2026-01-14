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
  const [manualExpanded, setManualExpanded] = useState(false);
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

  // Initialize caption
  useEffect(() => {
    if (captions.length > 0) {
      setEditedCaption(captions[selectedCaptionIndex]?.caption_text || "");
      setManualExpanded(false);
    }
  }, [captions, selectedCaptionIndex]);

  // Reset copied state
  useEffect(() => {
    setCaptionCopied(false);
  }, [editedCaption, selectedCaptionIndex]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedCaption, isConnected, activeTab]);

  const handlePost = async () => {
    try {
      const blob = await generateImageBlob();
      if (!blob) return;

      const result = await post(blob, editedCaption);
      if (result?.reconnect) {
        await checkStatus();
      }
    } catch (error) {
      console.error("Failed to post:", error);
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

  const [isMac, setIsMac] = useState(false);
  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().includes("MAC"));
  }, []);
  const shortcutKey = isMac ? "⌘V" : "Ctrl+V";

  const CaptionPills = () => {
    if (captions.length <= 1) return null;
    return (
      <div className="flex flex-wrap gap-2 mb-3">
        {captions.map((c, index) => (
          <button
            key={c.id}
            onClick={() => setSelectedCaptionIndex(index)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border font-medium transition-all",
              index === selectedCaptionIndex
                ? "border-[#0077B5] bg-[#0077B5]/10 text-[#0077B5]"
                : "border-border text-muted-foreground hover:border-foreground/30",
            )}
          >
            Caption {index + 1}
          </button>
        ))}
      </div>
    );
  };

  if (postUrl) {
    return (
      <div className="rounded-xl border border-[#0077B5]/20 p-4 mt-4 text-center">
        <Check className="mx-auto mb-2 text-green-500" />
        <Button variant="outline" className="w-full" onClick={() => window.open(postUrl, "_blank")}>
          View on LinkedIn
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-[#0077B5]/20 p-4 mt-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center">
          <Linkedin className="h-4 w-4 text-white" />
        </div>
        <span className="font-semibold">Share to LinkedIn</span>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted/50 rounded-lg mb-4">
        <button
          onClick={() => setActiveTab("direct")}
          className={cn(
            "flex-1 py-2 text-sm rounded-md",
            activeTab === "direct" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          Direct Post
        </button>
        <button
          onClick={() => setActiveTab("manual")}
          className={cn(
            "flex-1 py-2 text-sm rounded-md",
            activeTab === "manual" ? "bg-background shadow-sm" : "text-muted-foreground",
          )}
        >
          Manual Share
        </button>
      </div>

      {/* DIRECT POST (unchanged) */}
      {activeTab === "direct" && (
        <div className="space-y-4">
          <CaptionPills />

          <div className="rounded-lg border p-3">
            <Textarea
              ref={textareaRef}
              value={editedCaption}
              onChange={(e) => setEditedCaption(e.target.value)}
              className="resize-none border-0 p-0 text-sm"
            />
            <div className="flex justify-end mt-2">
              <span
                className={cn(
                  "text-xs",
                  isOverLimit && "text-destructive",
                  isNearLimit && "text-amber-500",
                  !isNearLimit && !isOverLimit && "text-muted-foreground",
                )}
              >
                {editedCaption.length}/{MAX_CAPTION_LENGTH}
              </span>
            </div>
          </div>

          <Button onClick={handlePost} disabled={isPosting || isOverLimit} className="w-full bg-[#0077B5] text-white">
            {isPosting ? <Loader2 className="mr-2 animate-spin" /> : <Send className="mr-2" />}
            Post to LinkedIn
          </Button>
        </div>
      )}

      {/* MANUAL SHARE (ONLY SECTION CHANGED) */}
      {activeTab === "manual" && (
        <div className="space-y-4">
          {/* Step 1 */}
          <Button onClick={handleManualShare} disabled={isLoading} className="w-full bg-[#0077B5] text-white">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open LinkedIn to Share
          </Button>

          {/* Step 2 */}
          <div>
            <p className="font-medium text-sm mb-2">Add your caption</p>
            <CaptionPills />

            <div className="rounded-lg border border-border bg-card/50 p-3 relative">
              <p
                className={cn(
                  "text-xs text-muted-foreground italic whitespace-pre-wrap break-words",
                  !manualExpanded && "line-clamp-3",
                )}
              >
                "
                {manualExpanded
                  ? editedCaption
                  : editedCaption.length > 150
                    ? editedCaption.substring(0, 150)
                    : editedCaption}
                "
              </p>

              {!manualExpanded && editedCaption.length > 150 && (
                <div className="pointer-events-none absolute bottom-3 left-3 right-3 h-6 bg-gradient-to-t from-card/90 to-transparent" />
              )}

              {editedCaption.length > 150 && (
                <button
                  onClick={() => setManualExpanded((v) => !v)}
                  className="mt-1 text-[11px] font-medium text-[#0077B5] hover:underline"
                >
                  {manualExpanded ? "See less" : "See more"}
                </button>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleCopyCaption}
              disabled={captionCopied || !editedCaption}
              className={cn(
                "w-full h-9 text-xs font-medium mt-2",
                captionCopied ? "bg-green-600 text-white" : "bg-[#0077B5] text-white",
              )}
            >
              {captionCopied ? "Copied! Paste in LinkedIn" : "Copy Caption"}
            </Button>
          </div>

          {/* Step 3 */}
          <p className="text-xs text-muted-foreground text-center">Paste caption and click “Post” on LinkedIn</p>
        </div>
      )}
    </div>
  );
}
