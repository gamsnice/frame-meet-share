import { Button } from "@/components/ui/button";
import { Download, ArrowLeft } from "lucide-react";

interface ActionButtonsProps {
  onChangePhoto: () => void;
  onDownload: () => void;
  onResetTemplate?: () => void;
  isMobile?: boolean;
}

export function ActionButtons({
  onChangePhoto,
  onDownload,
  onResetTemplate,
  isMobile = false,
}: ActionButtonsProps) {
  if (isMobile) {
    return (
      <div className="flex gap-2">
        <Button
          onClick={onChangePhoto}
          variant="secondary"
          size="sm"
          className="flex-1 min-h-[40px] text-xs"
        >
          Change Photo
        </Button>
        <Button 
          onClick={onDownload} 
          variant="default" 
          size="sm" 
          className="flex-1 min-h-[40px] text-xs"
        >
          <Download className="h-4 w-4 mr-1.5" />
          Download
        </Button>
        {onResetTemplate && (
          <Button onClick={onResetTemplate} variant="ghost" size="sm" className="min-h-[40px] px-3">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      <Button
        onClick={onChangePhoto}
        variant="secondary"
        size="sm"
        className="flex-1 min-h-[44px] text-sm"
      >
        Change Photo
      </Button>
      <Button 
        onClick={onDownload} 
        variant="default" 
        size="sm" 
        className="flex-1 min-h-[44px] text-sm"
      >
        <Download className="mr-2 h-4 w-4" />
        Download
      </Button>
    </div>
  );
}
