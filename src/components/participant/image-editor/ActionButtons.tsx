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
          variant="outline"
          size="sm"
          className="flex-1 min-h-[32px] text-[10px]"
        >
          Change Photo
        </Button>
        <Button 
          onClick={onDownload} 
          variant="outline" 
          size="sm" 
          className="flex-1 min-h-[32px] text-[10px]"
        >
          <Download className="h-3 w-3 mr-1" />
          Download
        </Button>
        {onResetTemplate && (
          <Button onClick={onResetTemplate} variant="ghost" size="sm" className="min-h-[32px] text-[10px] px-2">
            <ArrowLeft className="h-3 w-3" />
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
        className="flex-1 min-h-[36px] text-xs"
      >
        Change Photo
      </Button>
      <Button 
        onClick={onDownload} 
        variant="outline" 
        size="sm" 
        className="flex-1 min-h-[36px] text-xs"
      >
        <Download className="mr-1.5 h-3 w-3" />
        Download
      </Button>
    </div>
  );
}
