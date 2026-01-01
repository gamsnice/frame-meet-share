import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Linkedin, Loader2, X } from "lucide-react";
import { LinkedInShareGuide } from "./LinkedInShareGuide";

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
  const handleShare = async () => {
    await onShareToLinkedIn();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="relative">
          <DialogTitle className="text-center pr-8">Share Your Visual</DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-0 top-0 h-8 w-8 rounded-full"
            onClick={() => onOpenChange(false)}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          {/* Primary Share Button */}
          <Button
            onClick={handleShare}
            disabled={isLoading}
            className="w-full min-h-[48px] text-base bg-[#0077B5] hover:bg-[#005885] text-white"
          >
            {isLoading ? (
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            ) : (
              <Linkedin className="h-5 w-5 mr-2" />
            )}
            Share directly to LinkedIn
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Opens LinkedIn with your image ready to paste
          </p>

          {/* Divider */}
          <div className="border-t border-border" />

          {/* Step-by-step Guide */}
          <LinkedInShareGuide caption={caption} onCaptionCopied={onCaptionCopied} />
        </div>
      </DialogContent>
    </Dialog>
  );
}
