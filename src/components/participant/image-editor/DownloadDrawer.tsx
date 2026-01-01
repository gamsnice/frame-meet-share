import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Save, FileDown, Linkedin, Loader2 } from "lucide-react";

interface DownloadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveToPhotos: () => void;
  onDownloadAsFile: () => void;
  onShareToLinkedIn?: () => Promise<void>;
  isLoading?: boolean;
  captionPreview?: string;
}

export function DownloadDrawer({
  open,
  onOpenChange,
  onSaveToPhotos,
  onDownloadAsFile,
  onShareToLinkedIn,
  isLoading = false,
  captionPreview,
}: DownloadDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Save & Share Your Visual</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-3">
          {/* LinkedIn Share - Primary Action */}
          {onShareToLinkedIn && (
            <div className="space-y-2">
              <Button 
                onClick={onShareToLinkedIn} 
                disabled={isLoading}
                className="w-full min-h-[56px] text-base bg-[#0077B5] hover:bg-[#005885] text-white"
              >
                {isLoading ? (
                  <Loader2 className="h-6 w-6 mr-3 animate-spin" />
                ) : (
                  <Linkedin className="h-6 w-6 mr-3" />
                )}
                <div className="text-left">
                  <div className="font-medium">Share to LinkedIn</div>
                  <div className="text-xs opacity-80">Post your visual with one tap</div>
                </div>
              </Button>
              {captionPreview && (
                <div className="bg-muted/50 rounded-md p-2 border border-border">
                  <p className="text-[10px] text-muted-foreground mb-1">Caption included:</p>
                  <p className="text-xs line-clamp-2">{captionPreview}</p>
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-2 py-1">
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground px-2">or save locally</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button 
            onClick={onSaveToPhotos} 
            className="w-full min-h-[56px] text-base justify-start gap-4"
            variant="outline"
          >
            <Save className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Save to Photos</div>
              <div className="text-xs text-muted-foreground">Add to your camera roll</div>
            </div>
          </Button>
          <Button
            onClick={onDownloadAsFile}
            className="w-full min-h-[56px] text-base justify-start gap-4"
            variant="outline"
          >
            <FileDown className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Download as File</div>
              <div className="text-xs text-muted-foreground">Save to Downloads folder</div>
            </div>
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
