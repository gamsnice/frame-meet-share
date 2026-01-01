import { Copy, Check, Image, MessageSquare, Send, ChevronDown, ChevronUp } from "lucide-react";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ShareGuideSectionProps {
  caption?: string;
  isMobile?: boolean;
  defaultOpen?: boolean;
}

export function ShareGuideSection({ caption, isMobile = false, defaultOpen = true }: ShareGuideSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [captionCopied, setCaptionCopied] = useState(false);
  const [isMac, setIsMac] = useState(false);

  useEffect(() => {
    setIsMac(navigator.platform.toUpperCase().indexOf("MAC") >= 0);
  }, []);

  const handleCopyCaption = () => {
    if (caption) {
      navigator.clipboard.writeText(caption);
      setCaptionCopied(true);
      setTimeout(() => setCaptionCopied(false), 3000);
    }
  };

  const shortcutKey = isMac ? "⌘V" : "Ctrl+V";

  const truncatedCaption = caption && caption.length > 60 
    ? caption.substring(0, 60) + "..." 
    : caption;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-lg border border-[#0077B5]/30 bg-[#0077B5]/5 overflow-hidden">
        <CollapsibleTrigger asChild>
          <button className="w-full flex items-center justify-between px-3 py-2 hover:bg-[#0077B5]/10 transition-colors">
            <span className="text-[#0077B5] font-medium text-sm">How to share on LinkedIn</span>
            {isOpen ? (
              <ChevronUp className="w-4 h-4 text-[#0077B5]" />
            ) : (
              <ChevronDown className="w-4 h-4 text-[#0077B5]" />
            )}
          </button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className={`px-3 pb-3 space-y-2.5 ${isMobile ? "pt-1" : "pt-0"}`}>
            {/* Step 1 */}
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-[10px] font-bold">
                1
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">Click "Share to LinkedIn" below</p>
                <p className="text-[10px] text-muted-foreground">
                  We'll copy your image & open LinkedIn
                </p>
              </div>
              <Image className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-[10px] font-bold">
                2
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">Paste your image in LinkedIn</p>
                <p className="text-[10px] text-muted-foreground">
                  Press <kbd className="px-1 py-0.5 bg-muted rounded text-[9px] font-mono">{shortcutKey}</kbd> in the post composer
                </p>
              </div>
              <Send className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>

            {/* Step 3 - Caption */}
            <div className="flex items-start gap-2.5">
              <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#0077B5] text-white flex items-center justify-center text-[10px] font-bold">
                3
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-xs">Add your caption & post</p>
                {caption ? (
                  <div className="mt-1 space-y-1">
                    <p className="text-[10px] text-muted-foreground line-clamp-2 italic">"{truncatedCaption}"</p>
                    <Button 
                      size="sm" 
                      onClick={handleCopyCaption}
                      disabled={captionCopied}
                      className={`h-6 text-[10px] px-2 ${
                        captionCopied 
                          ? "bg-green-600 hover:bg-green-600 text-white" 
                          : "bg-[#0077B5] hover:bg-[#005885] text-white"
                      }`}
                    >
                      {captionCopied ? (
                        <>
                          <Check className="w-3 h-3 mr-1" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 mr-1" />
                          Copy Caption
                        </>
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Write something about your experience</p>
                )}
              </div>
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 mt-0.5" />
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}
