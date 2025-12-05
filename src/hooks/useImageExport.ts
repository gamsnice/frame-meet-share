import { useCallback } from "react";
import { toast } from "sonner";
import { FORMAT_DIMENSIONS, type Template } from "@/types";

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
  onDownload: () => void;
  setIsDownloadDrawerOpen: (open: boolean) => void;
}

interface UseImageExportReturn {
  generateImageBlob: () => Promise<Blob | null>;
  handleDownloadAsFile: () => Promise<void>;
  handleSaveToPhotos: () => Promise<void>;
  handleDownloadClick: (isMobile: boolean) => void;
}

export function useImageExport({
  template,
  userImageElement,
  templateImageElement,
  scale,
  position,
  eventSlug,
  onDownload,
  setIsDownloadDrawerOpen,
}: UseImageExportProps): UseImageExportReturn {
  
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

  const handleDownloadAsFile = useCallback(async () => {
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
  }, [generateImageBlob, getFilename, onDownload, setIsDownloadDrawerOpen]);

  const handleSaveToPhotos = useCallback(async () => {
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

    // Fallback to regular download
    await handleDownloadAsFile();
  }, [generateImageBlob, getFilename, handleDownloadAsFile, onDownload, setIsDownloadDrawerOpen]);

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
  };
}
