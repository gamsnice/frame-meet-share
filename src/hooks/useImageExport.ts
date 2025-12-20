import { useCallback, useState } from "react";
import { toast } from "sonner";
import { FORMAT_DIMENSIONS, type Template } from "@/types";
import { trackDownloadWithLimit } from "@/lib/analytics";

interface Position {
  x: number;
  y: number;
}

interface UseImageExportProps {
  template: Template;
  userImageElement: HTMLImageElement | null;
  templateImageElement: HTMLImageElement | null;
  scale: number;
  position: Position;
  eventSlug: string;
  eventId: string;
  onDownload: () => void;
  setIsDownloadDrawerOpen: (open: boolean) => void;
}

interface UseImageExportReturn {
  generateImageBlob: () => Promise<Blob | null>;
  handleDownloadAsFile: () => Promise<void>;
  handleSaveToPhotos: () => Promise<void>;
  handleDownloadClick: (isMobile: boolean) => void;
  isCheckingLimit: boolean;
}

export function useImageExport({
  template,
  userImageElement,
  templateImageElement,
  scale,
  position,
  eventSlug,
  eventId,
  onDownload,
  setIsDownloadDrawerOpen,
}: UseImageExportProps): UseImageExportReturn {
  const [isCheckingLimit, setIsCheckingLimit] = useState(false);
  
  const generateImageBlob = useCallback((): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!userImageElement || !templateImageElement) {
        resolve(null);
        return;
      }

      const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
      const canvas = document.createElement("canvas");
      canvas.width = dimensions.width;
      canvas.height = dimensions.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }

      // Calculate frame position at full resolution
      const frameX = template.photo_frame_x * dimensions.width;
      const frameY = template.photo_frame_y * dimensions.height;
      const frameWidth = template.photo_frame_width * dimensions.width;
      const frameHeight = template.photo_frame_height * dimensions.height;

      // Draw user image clipped to frame
      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameWidth, frameHeight);
      ctx.clip();

      const scaledUserWidth = userImageElement.width * scale;
      const scaledUserHeight = userImageElement.height * scale;

      ctx.drawImage(userImageElement, frameX + position.x, frameY + position.y, scaledUserWidth, scaledUserHeight);
      ctx.restore();

      // Draw template overlay
      ctx.drawImage(templateImageElement, 0, 0, dimensions.width, dimensions.height);

      canvas.toBlob((blob) => resolve(blob), "image/png", 1.0);
    });
  }, [position, scale, template, templateImageElement, userImageElement]);

  const getFilename = useCallback(() => {
    return `${eventSlug}-${template.name.replace(/\s+/g, "-").toLowerCase()}-meetme.png`;
  }, [eventSlug, template.name]);

  const checkLimitAndDownload = useCallback(async (): Promise<boolean> => {
    setIsCheckingLimit(true);
    try {
      const result = await trackDownloadWithLimit(eventId, template.id);
      
      if (!result.success) {
        if (result.limitReached) {
          toast.error("Download limit reached. The event organizer needs to upgrade their plan.");
        } else {
          toast.error(result.message || "Unable to download at this time.");
        }
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking download limit:", error);
      return true; // Allow download on error to not block users
    } finally {
      setIsCheckingLimit(false);
    }
  }, [eventId, template.id]);

  const handleDownloadAsFile = useCallback(async () => {
    const canDownload = await checkLimitAndDownload();
    if (!canDownload) return;

    const blob = await generateImageBlob();
    if (!blob) {
      toast.error("Please upload a photo first");
      return;
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = getFilename();
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Image downloaded!");
    onDownload();
    setIsDownloadDrawerOpen(false);
  }, [checkLimitAndDownload, generateImageBlob, getFilename, onDownload, setIsDownloadDrawerOpen]);

  const handleSaveToPhotos = useCallback(async () => {
    const canDownload = await checkLimitAndDownload();
    if (!canDownload) return;

    const blob = await generateImageBlob();
    if (!blob) {
      toast.error("Please upload a photo first");
      return;
    }

    const filename = getFilename();
    const file = new File([blob], filename, { type: "image/png" });

    // Try Web Share API first (works on mobile for saving to photos)
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: "My Event Visual",
        });
        toast.success("Saved! Share it everywhere 🎉");
        onDownload();
        setIsDownloadDrawerOpen(false);
        return;
      } catch (err: any) {
        // User cancelled or share failed
        if (err.name !== "AbortError") {
          console.error("Share failed:", err);
        }
      }
    }

    // Fallback to regular download (limit already checked)
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Image downloaded!");
    onDownload();
    setIsDownloadDrawerOpen(false);
  }, [checkLimitAndDownload, generateImageBlob, getFilename, onDownload, setIsDownloadDrawerOpen]);

  const handleDownloadClick = useCallback((isMobile: boolean) => {
    if (!userImageElement || !templateImageElement) {
      toast.error("Please upload a photo first");
      return;
    }

    // On mobile, show options drawer
    if (isMobile) {
      setIsDownloadDrawerOpen(true);
      return;
    }

    // On desktop, direct download
    handleDownloadAsFile();
  }, [handleDownloadAsFile, setIsDownloadDrawerOpen, templateImageElement, userImageElement]);

  return {
    generateImageBlob,
    handleDownloadAsFile,
    handleSaveToPhotos,
    handleDownloadClick,
    isCheckingLimit,
  };
}
