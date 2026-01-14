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

  useEffect(() => {
    if (captions.length > 0) {
      setEditedCaption(captions[selectedCaptionIndex]?.caption_text || "");
      setManualExpanded(false);
    }
  }, [captions, selectedCaptionIndex]);

  useEffect(() => {
    setCaptionCopied(false);
  }, [editedCaption]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [editedCaption, activeTab, isConnected]);

  const handlePost = async () => {
    const blob = await generateImageBlob();
    if (!blob) return;
    await post(blob, editedCaption);
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

  const CaptionPills = () =>
    captions.length > 1 ? (
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
    ) : null;

  if (postUrl) {
    return (
      <div className="rounded-xl border p-4 mt-4 text-center">
        <Check className="mx-auto mb-2 text-green-500" />
        <Button onClick={() => window.open(postUrl, "_blank")} variant="outline">
          View on LinkedIn
        </Button>
      </div>
    );
  }

  return (
    <div className="rounded-xl border p-4 mt-4">
      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-muted/50 p-1 rounded-lg">
        {["direct", "manual"].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as any)}
            className={cn(
              "flex-1 py-2 text-sm rounded-md",
              activeTab === tab ? "bg-background shadow-sm" : "text-muted-foreground",
            )}
          >
            {tab === "direct" ? "Direct Post" : "Manual Share"}
          </button>
        ))}
      </div>

      {/* MANUAL SHARE */}
      {activeTab === "manual" && (
        <div className="space-y-4">
          {/* Step 1 */}
          <Button onClick={handleManualShare} className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Open LinkedIn
          </Button>

          {/* Step 2 */}
          <div>
            <p className="font-medium text-sm mb-2">Add your caption</p>
            <CaptionPills />

            {/* LinkedIn-style caption preview */}
            <div className="relative rounded-lg border bg-card/50 p-3">
              <p
                className={cn(
                  "text-xs italic whitespace-pre-wrap break-words transition-all",
                  !manualExpanded && "line-clamp-3",
                )}
              >
                {editedCaption}
              </p>

              {!manualExpanded && (
                <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-card/90 to-transparent" />
              )}

              {editedCaption.length > 180 && (
                <button
                  onClick={() => setManualExpanded(!manualExpanded)}
                  className="mt-1 text-[11px] font-medium text-[#0077B5] hover:underline"
                >
                  {manualExpanded ? "See less" : "See more"}
                </button>
              )}
            </div>

            <Button
              size="sm"
              onClick={handleCopyCaption}
              disabled={captionCopied}
              className={cn("w-full mt-2", captionCopied ? "bg-green-600 text-white" : "bg-[#0077B5] text-white")}
            >
              {captionCopied ? "Copied!" : "Copy Caption"}
            </Button>
          </div>

          {/* Step 3 */}
          <p className="text-xs text-muted-foreground text-center">Paste caption & click “Post” on LinkedIn</p>
        </div>
      )}
    </div>
  );
}
