import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Caption } from "@/types";

interface LinkedInPostPreviewProps {
  linkedInName: string | null;
  imagePreviewUrl: string | null;
  caption: string;
  onCaptionChange: (caption: string) => void;
  onPost: () => void;
  isPosting: boolean;
  captions: Caption[];
  className?: string;
}

const MAX_CAPTION_LENGTH = 3000;

export function LinkedInPostPreview({
  linkedInName,
  imagePreviewUrl,
  caption,
  onCaptionChange,
  onPost,
  isPosting,
  captions,
  className,
}: LinkedInPostPreviewProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [caption]);

  const handleQuickSwitch = (captionText: string) => {
    onCaptionChange(captionText);
  };

  const charactersRemaining = MAX_CAPTION_LENGTH - caption.length;
  const isOverLimit = charactersRemaining < 0;
  const isNearLimit = charactersRemaining < 200 && charactersRemaining >= 0;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header - LinkedIn style */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-[#0077B5] flex items-center justify-center">
          <Linkedin className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{linkedInName || "Your LinkedIn Profile"}</p>
          <p className="text-xs text-muted-foreground">Posting to LinkedIn</p>
        </div>
      </div>

      {/* Post Preview Card */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {/* Image Preview - Above Caption */}
        {imagePreviewUrl && (
          <div className="border-b border-border">
            <img
              src={imagePreviewUrl}
              alt="Post preview"
              className="w-full h-auto object-contain max-h-[250px] bg-muted/30"
            />
          </div>
        )}

        {/* Caption Input Area */}
        <div className="p-4">
          {/* Quick-switch pills (if multiple captions) */}
          {captions.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {captions.map((c, index) => (
                <button
                  key={c.id}
                  onClick={() => handleQuickSwitch(c.caption_text)}
                  className={cn(
                    "px-3 py-1 text-xs rounded-full border transition-colors",
                    caption === c.caption_text
                      ? "border-[#0077B5] bg-[#0077B5]/10 text-[#0077B5]"
                      : "border-border text-muted-foreground hover:border-foreground/30",
                  )}
                >
                  Caption {index + 1}
                </button>
              ))}
            </div>
          )}

          {/* Editable Caption */}
          <Textarea
            ref={textareaRef}
            value={caption}
            onChange={(e) => onCaptionChange(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder="Write something about your event visual..."
            className={cn(
              "min-h-[80px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent text-sm",
              isFocused && "placeholder:text-muted-foreground/50",
            )}
            disabled={isPosting}
          />

          {/* Character count */}
          <div className="flex justify-end mt-2">
            <span
              className={cn(
                "text-xs",
                isOverLimit && "text-destructive font-medium",
                isNearLimit && !isOverLimit && "text-amber-500",
                !isNearLimit && !isOverLimit && "text-muted-foreground",
              )}
            >
              {caption.length}/{MAX_CAPTION_LENGTH}
            </span>
          </div>
        </div>
      </div>

      {/* Post Button */}
      <Button
        onClick={onPost}
        disabled={isPosting || isOverLimit}
        className="w-full min-h-[48px] bg-[#0077B5] hover:bg-[#005885] text-white font-medium"
      >
        {isPosting ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Posting...
          </>
        ) : (
          <>
            <Send className="h-4 w-4 mr-2" />
            Post to LinkedIn
          </>
        )}
      </Button>

      {isOverLimit && (
        <p className="text-xs text-destructive text-center">
          Caption exceeds LinkedIn's {MAX_CAPTION_LENGTH} character limit
        </p>
      )}
    </div>
  );
}
