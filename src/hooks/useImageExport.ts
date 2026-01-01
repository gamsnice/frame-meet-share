import { useCallback, useState } from "react";
import { toast } from "sonner";
import { FORMAT_DIMENSIONS, type Template, type Caption } from "@/types";
import { trackDownloadWithLimit } from "@/lib/analytics";
import { isMobileDevice } from "@/lib/utils";

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
  eventName?: string;
  captions?: Caption[];
  onDownload: () => void;
  setIsDownloadDrawerOpen: (open: boolean) => void;
}

interface UseImageExportReturn {
  generateImageBlob: () => Promise<Blob | null>;
  handleDownloadAsFile: () => Promise<void>;
  handleSaveToPhotos: () => Promise<void>;
  handleDownloadClick: (isMobile: boolean) => void;
  handleShareToLinkedIn: () => Promise<void>;
  isCheckingLimit: boolean;
  getFilename: () => string;
}

export function useImageExport({
  template,
  userImageElement,
  templateImageElement,
  scale,
  position,
  eventSlug,
  eventId,
  eventName,
  captions = [],
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
          toast.error(
            "Download limit reached. Contact the event organizers to let them know that downloads are currently blocked.",
          );
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

  const handleDownloadClick = useCallback(
    (isMobile: boolean) => {
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
    },
    [handleDownloadAsFile, setIsDownloadDrawerOpen, templateImageElement, userImageElement],
  );

  const handleShareToLinkedIn = useCallback(async () => {
    if (!userImageElement || !templateImageElement) {
      toast.error("Please upload a photo first");
      return;
    }

    const canDownload = await checkLimitAndDownload();
    if (!canDownload) return;

    const blob = await generateImageBlob();
    if (!blob) {
      toast.error("Failed to generate image");
      return;
    }

    const filename = getFilename();
    const file = new File([blob], filename, { type: "image/png" });
    const captionText = captions[0]?.caption_text || "";

    // Only use Web Share API on actual mobile devices (iOS/Android)
    // Desktop browsers may support it but the share sheet won't include LinkedIn
    const isMobile = isMobileDevice();
    
    if (isMobile && navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: eventName || "My Event Visual",
          text: captionText,
        });
        toast.success("Shared successfully!");
        onDownload();
        setIsDownloadDrawerOpen(false);
        return;
      } catch (err: any) {
        if (err.name === "AbortError") {
          // User cancelled - don't show error
          return;
        }
        console.error("Share failed:", err);
      }
    }

    // Desktop fallback: download image, copy caption, open LinkedIn
    try {
      // Download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      // Copy caption if available
      if (captionText) {
        await navigator.clipboard.writeText(captionText);
        toast.success("Image downloaded & caption copied! Paste it in your LinkedIn post.", {
          duration: 5000,
        });
      } else {
        toast.success("Image downloaded! Attach it to your LinkedIn post.", {
          duration: 4000,
        });
      }

      // Open LinkedIn post composer
      window.open("https://www.linkedin.com/feed/?shareActive=true", "_blank");
      
      onDownload();
      setIsDownloadDrawerOpen(false);
    } catch (err) {
      console.error("Desktop share failed:", err);
      toast.error("Failed to prepare share. Please try downloading manually.");
    }
  }, [
    userImageElement,
    templateImageElement,
    checkLimitAndDownload,
    generateImageBlob,
    getFilename,
    captions,
    eventName,
    onDownload,
    setIsDownloadDrawerOpen,
  ]);

  return {
    generateImageBlob,
    handleDownloadAsFile,
    handleSaveToPhotos,
    handleDownloadClick,
    handleShareToLinkedIn,
    isCheckingLimit,
    getFilename,
  };
}
