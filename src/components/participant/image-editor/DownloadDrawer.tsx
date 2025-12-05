import { Button } from "@/components/ui/button";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { Save, FileDown } from "lucide-react";

interface DownloadDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSaveToPhotos: () => void;
  onDownloadAsFile: () => void;
}

export function DownloadDrawer({
  open,
  onOpenChange,
  onSaveToPhotos,
  onDownloadAsFile,
}: DownloadDrawerProps) {
  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle className="text-center">Save Your Visual</DrawerTitle>
        </DrawerHeader>
        <div className="p-4 pb-8 space-y-3">
          <Button onClick={onSaveToPhotos} className="w-full min-h-[56px] text-base justify-start gap-4">
            <Save className="h-6 w-6" />
            <div className="text-left">
              <div className="font-medium">Save to Photos</div>
              <div className="text-xs opacity-80">Add to your camera roll</div>
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
