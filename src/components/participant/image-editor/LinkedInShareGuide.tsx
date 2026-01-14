import { Copy, Check, Image, MessageSquare, Send } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Caption } from "@/types";

interface LinkedInShareGuideProps {
  caption: string;
  onCaptionCopied: () => void;
  captions?: Caption[];
  selectedCaptionIndex?: number;
  onCaptionChange?: (index: number) => void;
}

export function LinkedInShareGuide({ 
  caption, 
  onCaptionCopied,
  captions = [],
  selectedCaptionIndex = 0,
  onCaptionChange,
}: LinkedInShareGuideProps) {
  const [captionCopied, setCaptionCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  // Reset copied state when caption changes
  useEffect(() => {
    setCaptionCopied(false);
  }, [caption]);

  const handleCopyCaption = () => {
    navigator.clipboard.writeText(caption);
    setCaptionCopied(true);
    onCaptionCopied();
  };

  const shortcutKey = isMac ? "⌘V" : "Ctrl+V";

  const truncatedCaption = caption.length > 100 
    ? caption.substring(0, 100) + "..." 
    : caption;

  const hasMultipleCaptions = captions.length > 1;

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
            <div className="mt-1.5 space-y-2">
              {/* Caption quick-switch pills */}
              {hasMultipleCaptions && onCaptionChange && (
                <div className="flex flex-wrap gap-1.5">
                  {captions.map((c, index) => (
                    <button
                      key={c.id}
                      onClick={() => onCaptionChange(index)}
                      className={cn(
                        "px-2.5 py-1 text-[11px] rounded-full border transition-all",
                        "hover:border-foreground/30",
                        index === selectedCaptionIndex
                          ? "border-[#0077B5] bg-[#0077B5]/10 text-[#0077B5] font-medium"
                          : "border-border text-muted-foreground"
                      )}
                    >
                      Caption {index + 1}
                    </button>
                  ))}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground line-clamp-2 italic">"{truncatedCaption}"</p>
              <Button 
                size="sm" 
                onClick={handleCopyCaption}
                disabled={captionCopied}
                className={cn(
                  "h-8 text-xs w-full font-medium",
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
