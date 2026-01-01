import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface CaptionCopyToastProps {
  caption: string;
  onCopy: () => void;
}

export function CaptionCopyToast({ caption, onCopy }: CaptionCopyToastProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(caption);
    setCopied(true);
    onCopy();
    setTimeout(() => setCopied(false), 2000);
  };

  const truncatedCaption = caption.length > 60 
    ? caption.substring(0, 60) + "..." 
    : caption;

  return (
    <div className="flex flex-col gap-2">
      <p className="font-medium">Image copied! Paste with ⌘V</p>
      <p className="text-sm text-muted-foreground line-clamp-2">{truncatedCaption}</p>
      <Button 
        size="sm" 
        variant="secondary" 
        onClick={handleCopy}
        className="w-full mt-1"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2" />
            Caption copied!
          </>
        ) : (
          <>
            <Copy className="w-4 h-4 mr-2" />
            Copy caption
          </>
        )}
      </Button>
    </div>
  );
}
