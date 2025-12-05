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
          className="flex-1 min-h-[40px] text-xs"
        >
          Change Photo
        </Button>
        <Button onClick={onDownload} size="sm" className="flex-1 min-h-[40px] text-xs">
          <Download className="h-3.5 w-3.5 mr-1" />
          Download
        </Button>
        {onResetTemplate && (
          <Button onClick={onResetTemplate} variant="ghost" size="sm" className="min-h-[40px] text-xs px-3">
            <ArrowLeft className="h-3 w-3" />
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col sm:flex-row gap-2">
      <Button
        onClick={onChangePhoto}
        variant="outline"
        size="sm"
        className="flex-1 min-h-[44px]"
      >
        Change Photo
      </Button>
      <Button onClick={onDownload} size="sm" className="flex-1 min-h-[44px]">
        <Download className="mr-1.5 h-3.5 w-3.5" />
        Download
      </Button>
    </div>
  );
}
