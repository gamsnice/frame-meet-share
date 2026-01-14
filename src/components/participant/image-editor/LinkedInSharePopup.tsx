import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Linkedin, Loader2, X, Send, Copy } from "lucide-react";
import { LinkedInShareGuide } from "./LinkedInShareGuide";
import { LinkedInDirectPost } from "./LinkedInDirectPost";
import { cn } from "@/lib/utils";
import type { Caption } from "@/types";

interface LinkedInSharePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShareToLinkedIn: () => Promise<void>;
  isLoading: boolean;
  caption: string;
  onCaptionCopied: () => void;
  // New props for direct posting
  captions?: Caption[];
  generateImageBlob?: () => Promise<Blob | null>;
}

export function LinkedInSharePopup({
  open,
  onOpenChange,
  onShareToLinkedIn,
  isLoading,
  caption,
  onCaptionCopied,
  captions = [],
  generateImageBlob,
}: LinkedInSharePopupProps) {
  const [hasAnimated, setHasAnimated] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("direct");
  const [selectedCaptionIndex, setSelectedCaptionIndex] = useState(0);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  // Generate image preview URL when popup opens
  useEffect(() => {
    if (open && generateImageBlob) {
      generateImageBlob().then(blob => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          setImagePreviewUrl(url);
        }
      });
    }
    return () => {
      if (imagePreviewUrl) {
        URL.revokeObjectURL(imagePreviewUrl);
        setImagePreviewUrl(null);
      }
    };
  }, [open, generateImageBlob]);

  useEffect(() => {
    if (open) {
      setHasAnimated(true);
    }
  }, [open]);

  // Get currently selected caption text
  const selectedCaption = useMemo(() => {
    if (captions.length > 0 && captions[selectedCaptionIndex]) {
      return captions[selectedCaptionIndex].caption_text;
    }
    return caption;
  }, [captions, selectedCaptionIndex, caption]);

  if (!open) return null;

  const handleManualShare = async () => {
    await onShareToLinkedIn();
  };

  const handlePostSuccess = () => {
    // Close popup after successful post
    setTimeout(() => onOpenChange(false), 3000);
  };

  // Check if direct posting is available (has generateImageBlob function)
  const hasDirectPostSupport = !!generateImageBlob;

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-[420px] max-w-[calc(100vw-2rem)]",
        "bg-card/95 backdrop-blur-md border-2 border-[#0077B5]/30 rounded-xl",
        "shadow-2xl shadow-[#0077B5]/15",
        !hasAnimated && "animate-slide-in-right"
      )}
    >
      {/* Header with dismiss button */}
      <div className="flex items-center justify-between p-4 pb-0">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#0077B5] flex items-center justify-center">
            <Linkedin className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-base">Share to LinkedIn</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 rounded-full -mr-1 hover:bg-muted"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      {hasDirectPostSupport ? (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="w-full mx-4 mt-3 grid grid-cols-2" style={{ width: "calc(100% - 2rem)" }}>
            <TabsTrigger value="direct" className="text-xs">
              <Send className="h-3 w-3 mr-1.5" />
              Direct Post
            </TabsTrigger>
            <TabsTrigger value="manual" className="text-xs">
              <Copy className="h-3 w-3 mr-1.5" />
              Manual Share
            </TabsTrigger>
          </TabsList>

          <TabsContent value="direct" className="p-4 pt-3 mt-0">
            <LinkedInDirectPost
              captions={captions}
              generateImageBlob={generateImageBlob}
              onSuccess={handlePostSuccess}
            />
          </TabsContent>

          <TabsContent value="manual" className="p-4 pt-3 mt-0">
            <div className="flex flex-col gap-3">
              {/* Manual Share Button */}
              <Button
                onClick={handleManualShare}
                disabled={isLoading}
                className="w-full min-h-[44px] text-sm bg-[#0077B5] hover:bg-[#005885] text-white font-medium"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Linkedin className="h-4 w-4 mr-2" />
                )}
                Open LinkedIn to Share
              </Button>

              <p className="text-xs text-muted-foreground text-center">
                Opens LinkedIn with your image ready to paste
              </p>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Step-by-step Guide with caption selection */}
              <LinkedInShareGuide 
                caption={selectedCaption} 
                onCaptionCopied={onCaptionCopied}
                captions={captions}
                selectedCaptionIndex={selectedCaptionIndex}
                onCaptionChange={setSelectedCaptionIndex}
              />
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        // Fallback: Original manual-only UI
        <div className="flex flex-col gap-3 p-4">
          <Button
            onClick={handleManualShare}
            disabled={isLoading}
            className="w-full min-h-[44px] text-sm bg-[#0077B5] hover:bg-[#005885] text-white font-medium"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Linkedin className="h-4 w-4 mr-2" />
            )}
            Share directly to LinkedIn
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            Opens LinkedIn with your image ready to paste
          </p>

          <div className="border-t border-border" />

          <LinkedInShareGuide 
            caption={selectedCaption} 
            onCaptionCopied={onCaptionCopied}
            captions={captions}
            selectedCaptionIndex={selectedCaptionIndex}
            onCaptionChange={setSelectedCaptionIndex}
          />
        </div>
      )}
    </div>
  );
}
