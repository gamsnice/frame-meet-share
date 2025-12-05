import { Button } from "@/components/ui/button";
import { Instagram, Linkedin, Share2 } from "lucide-react";

interface SocialShareButtonsProps {
  isMobile?: boolean;
}

export function SocialShareButtons({ isMobile = false }: SocialShareButtonsProps) {
  const openLinkedIn = () => window.open("https://www.linkedin.com/feed/", "_blank");
  const openInstagram = () => window.open("https://www.instagram.com/", "_blank");

  if (isMobile) {
    return (
      <div id="social-share" className="pt-3 border-t border-border">
        <div className="flex items-center gap-2 mb-2">
          <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
          <p className="text-[10px] font-medium text-muted-foreground">Share on social media</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Button
            onClick={openLinkedIn}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0077B5]/10 to-[#0077B5]/5 border-[#0077B5]/30 hover:border-[#0077B5] hover:bg-[#0077B5]/10 transition-all min-h-[40px] text-xs"
          >
            <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />
            <span>LinkedIn</span>
          </Button>
          <Button
            onClick={openInstagram}
            variant="outline"
            size="sm"
            className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#E4405F]/10 to-[#833AB4]/10 border-[#E4405F]/30 hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-all min-h-[40px] text-xs"
          >
            <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
            <span>Instagram</span>
          </Button>
        </div>
        <p className="text-[9px] text-muted-foreground text-center mt-1.5">
          Download first, then upload to share
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-4 border-t border-border">
      <div className="flex items-center gap-2 mb-2">
        <Share2 className="h-4 w-4 text-muted-foreground" />
        <p className="text-xs font-medium text-muted-foreground"></p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <Button
          onClick={openLinkedIn}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0077B5]/10 to-[#0077B5]/5 border-[#0077B5]/30 hover:border-[#0077B5] hover:bg-[#0077B5]/10 transition-all"
        >
          <Linkedin className="h-4 w-4 text-[#0077B5]" />
          <span className="font-medium">Share on LinkedIn</span>
        </Button>
        <Button
          onClick={openInstagram}
          variant="outline"
          size="sm"
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E4405F]/10 to-[#833AB4]/10 border-[#E4405F]/30 hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-all"
        >
          <Instagram className="h-4 w-4 text-[#E4405F]" />
          <span className="font-medium">Share on Instagram</span>
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground text-center mt-2">
        Download first, then upload to your preferred platform
      </p>
    </div>
  );
}
