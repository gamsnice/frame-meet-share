import { Copy, Check, Image, MessageSquare, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface LinkedInShareGuideProps {
  caption: string;
  onCaptionCopied: () => void;
}

export function LinkedInShareGuide({ caption, onCaptionCopied }: LinkedInShareGuideProps) {
  const [captionCopied, setCaptionCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    onCaptionCopied();
  };

  const shortcutKey = isMac ? "⌘V" : "Ctrl+V";

  const truncatedCaption = caption.length > 80 
    ? caption.substring(0, 80) + "..." 
    : caption;

  return (
    <div className="flex flex-col gap-3 py-1">
      <p className="font-semibold text-[15px] text-[#0077B5]">Ready to post on LinkedIn</p>
      
      {/* Step 1 */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-xs font-bold">
          1
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Your image is copied</p>
          <p className="text-xs text-muted-foreground">
            In LinkedIn, press <kbd className="px-1.5 py-0.5 bg-muted rounded text-[11px] font-mono">{shortcutKey}</kbd> to paste it
          </p>
        </div>
        <Image className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
      </div>

      {/* Step 2 */}
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-xs font-bold">
          2
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm">Add your caption</p>
          {caption ? (
            <div className="mt-1.5 space-y-1.5">
              <p className="text-xs text-muted-foreground line-clamp-2 italic">"{truncatedCaption}"</p>
              <Button 
                size="sm" 
                onClick={handleCopyCaption}
                disabled={captionCopied}
                className={`h-7 text-xs w-full ${
                  captionCopied 
                    ? "bg-green-600 hover:bg-green-600 text-white" 
                    : "bg-[#0077B5] hover:bg-[#005885] text-white"
                }`}
              >
                {captionCopied ? (
                  <>
                    <Check className="w-3 h-3 mr-1.5" />
                    Copied! Paste in LinkedIn
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3 mr-1.5" />
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

      {/* Step 3 */}
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
  );
}
