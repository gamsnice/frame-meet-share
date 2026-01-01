import { Button } from "@/components/ui/button";
import { Download, ArrowLeft, Linkedin } from "lucide-react";

interface ActionButtonsProps {
  onChangePhoto: () => void;
  onDownload: () => void;
  onResetTemplate?: () => void;
  onOpenLinkedInPopup?: () => void;
  isMobile?: boolean;
}

export function ActionButtons({
  onChangePhoto,
  onDownload,
  onResetTemplate,
  onOpenLinkedInPopup,
  isMobile = false,
}: ActionButtonsProps) {
  if (isMobile) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={onChangePhoto}
          variant="outline"
          size="sm"
          className="flex-1 min-h-[34px] text-xs bg-muted/80 hover:bg-muted border-border"
        >
          Change Photo
        </Button>
        <Button 
          onClick={onDownload} 
          variant="default" 
          size="sm" 
          className="flex-1 min-h-[34px] text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Download
        </Button>
        {onOpenLinkedInPopup && (
          <Button 
            onClick={onOpenLinkedInPopup} 
            variant="outline" 
            size="sm" 
            className="min-h-[34px] px-2.5 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border-[#0077B5]/30"
          >
            <Linkedin className="h-4 w-4 text-[#0077B5]" />
          </Button>
        )}
        {onResetTemplate && (
          <Button onClick={onResetTemplate} variant="ghost" size="sm" className="min-h-[34px] px-2">
            <ArrowLeft className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={onChangePhoto}
        variant="outline"
        size="sm"
        className="flex-1 min-h-[36px] text-xs bg-muted/80 hover:bg-muted border-border"
      >
        Change Photo
      </Button>
      <Button 
        onClick={onDownload} 
        variant="default" 
        size="sm" 
        className="flex-1 min-h-[36px] text-xs"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
      {onOpenLinkedInPopup && (
        <Button 
          onClick={onOpenLinkedInPopup} 
          variant="outline" 
          size="sm" 
          className="min-h-[36px] px-2.5 bg-[#0077B5]/10 hover:bg-[#0077B5]/20 border-[#0077B5]/30"
        >
          <Linkedin className="h-4 w-4 text-[#0077B5]" />
        </Button>
      )}
    </div>
  );
}
