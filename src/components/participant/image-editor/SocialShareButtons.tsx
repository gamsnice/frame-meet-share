import { Button } from "@/components/ui/button";
import { Linkedin, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SocialShareButtonsProps {
  isMobile?: boolean;
  onShareToLinkedIn?: () => Promise<void>;
  isLoading?: boolean;
  showAttentionAnimation?: boolean;
}

export function SocialShareButtons({ 
  isMobile = false, 
  onShareToLinkedIn,
  isLoading = false,
  showAttentionAnimation = false,
}: SocialShareButtonsProps) {
  const handleLinkedInClick = async () => {
    if (onShareToLinkedIn) {
      await onShareToLinkedIn();
    } else {
      // Fallback: just open LinkedIn
      window.open("https://www.linkedin.com/feed/", "_blank");
    }
  };

  if (isMobile) {
    return (
      <div id="social-share" className="pt-3 border-t border-border">
        <Button
          onClick={handleLinkedInClick}
          disabled={isLoading}
          className={cn(
            "w-full min-h-[48px] text-base bg-[#0077B5] hover:bg-[#005885] text-white",
            showAttentionAnimation && "animate-[pulse_2s_ease-in-out_2]"
          )}
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          ) : (
            <Linkedin className="h-5 w-5 mr-2" />
          )}
          Share directly to LinkedIn
        </Button>
        <p className="text-[10px] text-muted-foreground text-center mt-2">
          {onShareToLinkedIn 
            ? "Opens share sheet with your visual"
            : "Download first, then share to LinkedIn"
          }
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <Button
        onClick={handleLinkedInClick}
        disabled={isLoading}
        className={cn(
          "w-full min-h-[44px] bg-[#0077B5] hover:bg-[#005885] text-white",
          showAttentionAnimation && "animate-[pulse_2s_ease-in-out_2]"
        )}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
            <Linkedin className="h-4 w-4 mr-2" />
        )}
        Share directly to LinkedIn
      </Button>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        {onShareToLinkedIn 
          ? "Opens LinkedIn with your image ready to paste"
          : "Download first, then share to LinkedIn"
        }
      </p>
    </div>
  );
}
