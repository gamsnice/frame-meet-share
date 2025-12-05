import { Button } from "@/components/ui/button";
import { Copy, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";
import type { Caption } from "@/types";

interface CaptionsSectionProps {
  captions: Caption[];
  captionsExpanded: boolean;
  onToggleExpand: () => void;
  onCopyCaption: (text: string) => void;
  isMobile?: boolean;
}

export function CaptionsSection({
  captions,
  captionsExpanded,
  onToggleExpand,
  onCopyCaption,
  isMobile = false,
}: CaptionsSectionProps) {
  if (captions.length === 0) return null;

  if (isMobile) {
    return (
      <div className="border border-border rounded-lg p-3">
        <button
          onClick={onToggleExpand}
          className="w-full flex items-center justify-between text-left"
        >
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Caption Ideas</span>
            <span className="text-[10px] text-muted-foreground">({captions.length})</span>
          </div>
          {captionsExpanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>

        {captionsExpanded && (
          <div className="mt-3 space-y-2">
            {captions.map((caption) => (
              <div key={caption.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                <p className="flex-1 text-xs whitespace-pre-wrap leading-relaxed">{caption.caption_text}</p>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onCopyCaption(caption.caption_text)}
                  className="shrink-0 h-7 w-7 p-0"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Desktop captions
  return (
    <div className="border border-border rounded-lg p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        <Lightbulb className="h-4 w-4 text-primary" />
        Caption Ideas
      </h3>
      <div className="space-y-2">
        {captions.map((caption) => (
          <div key={caption.id} className="flex items-start gap-3 p-2 bg-muted rounded-lg">
            <p className="flex-1 text-sm whitespace-pre-wrap">{caption.caption_text}</p>
            <Button size="sm" variant="ghost" onClick={() => onCopyCaption(caption.caption_text)} className="shrink-0">
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
