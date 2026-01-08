import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, X } from "lucide-react";
import { LinkedInShareGuide } from "./LinkedInShareGuide";
import { cn } from "@/lib/utils";

interface LinkedInSharePopupProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onShareToLinkedIn: () => Promise<void>;
  isLoading: boolean;
  caption: string;
  onCaptionCopied: () => void;
}

export function LinkedInSharePopup({
  open,
  onOpenChange,
  onShareToLinkedIn,
  isLoading,
  caption,
  onCaptionCopied,
}: LinkedInSharePopupProps) {
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (open) {
      setHasAnimated(true);
    }
  }, [open]);

  if (!open) return null;

  const handleShare = async () => {
    await onShareToLinkedIn();
  };

  return (
    <div
      className={cn(
        "fixed bottom-4 right-4 z-50 w-80 max-w-[calc(100vw-2rem)]",
        "bg-card border border-border rounded-lg shadow-xl p-4",
        !hasAnimated && "animate-slide-in-right"
      )}
    >
      {/* Header with dismiss button */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-sm">Share Your Visual</h3>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full -mr-1"
          onClick={() => onOpenChange(false)}
        >
          <X className="h-3.5 w-3.5" />
          <span className="sr-only">Close</span>
        </Button>
      </div>

      <div className="flex flex-col gap-3">
        {/* Primary Share Button */}
        <Button
          onClick={handleShare}
          disabled={isLoading}
          className="w-full min-h-[44px] text-sm bg-[#0077B5] hover:bg-[#005885] text-white"
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

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Step-by-step Guide */}
        <LinkedInShareGuide caption={caption} onCaptionCopied={onCaptionCopied} />
      </div>
    </div>
  );
}
