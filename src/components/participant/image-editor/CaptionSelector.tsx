import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Caption } from "@/types";

interface CaptionSelectorProps {
  captions: Caption[];
  selectedCaption: string;
  onSelectCaption: (caption: string) => void;
  className?: string;
}

export function CaptionSelector({
  captions,
  selectedCaption,
  onSelectCaption,
  className,
}: CaptionSelectorProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleCopy = async (text: string, index: number) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  // If no captions, don't render anything
  if (captions.length === 0) {
    return null;
  }

  // If only one caption, auto-select it and show a preview
  if (captions.length === 1) {
    return (
      <div className={cn("space-y-2", className)}>
        <p className="text-sm font-medium text-foreground">Caption</p>
        <div className="p-3 rounded-lg bg-muted/50 border border-border">
          <p className="text-sm text-muted-foreground line-clamp-3">
            {captions[0].caption_text}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-3", className)}>
      <p className="text-sm font-medium text-foreground">Choose a caption</p>
      
      <RadioGroup
        value={selectedCaption}
        onValueChange={onSelectCaption}
        className="space-y-2"
      >
        {/* No caption option */}
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="" id="no-caption" />
          <Label 
            htmlFor="no-caption" 
            className="text-sm text-muted-foreground cursor-pointer"
          >
            No caption
          </Label>
        </div>

        {/* Caption options */}
        {captions.map((caption, index) => (
          <div
            key={caption.id}
            className={cn(
              "flex items-start gap-2 p-3 rounded-lg border transition-colors cursor-pointer",
              selectedCaption === caption.caption_text
                ? "border-primary bg-primary/5"
                : "border-border bg-muted/30 hover:bg-muted/50"
            )}
            onClick={() => onSelectCaption(caption.caption_text)}
          >
            <RadioGroupItem 
              value={caption.caption_text} 
              id={`caption-${index}`}
              className="mt-0.5"
            />
            <div className="flex-1 min-w-0">
              <Label 
                htmlFor={`caption-${index}`}
                className="text-sm text-foreground cursor-pointer line-clamp-3"
              >
                {caption.caption_text}
              </Label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                handleCopy(caption.caption_text, index);
              }}
            >
              {copiedIndex === index ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </Button>
          </div>
        ))}
      </RadioGroup>
    </div>
  );
}
