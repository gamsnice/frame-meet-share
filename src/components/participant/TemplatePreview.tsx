import { useEffect, useRef, useState } from "react";
import { FORMAT_DIMENSIONS, type TemplateBase } from "@/types";

interface TemplatePreviewProps {
  template: TemplateBase;
  className?: string;
}

export default function TemplatePreview({ template, className = "" }: TemplatePreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);
  const [placeholderImg, setPlaceholderImg] = useState<HTMLImageElement | null>(null);

  // Load template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setTemplateImg(img);
    img.src = template.image_url;
  }, [template.image_url]);

  // Load placeholder image (prefer joined relation, fallback to direct URL)
  useEffect(() => {
    const placeholderUrl = template.placeholder_image?.image_url || template.placeholder_image_url;
    if (placeholderUrl) {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => setPlaceholderImg(img);
      img.src = placeholderUrl;
    } else {
      setPlaceholderImg(null);
    }
  }, [template.placeholder_image?.image_url, template.placeholder_image_url]);

  // Draw composite
  useEffect(() => {
    if (canvasRef.current && templateImg) {
      drawComposite();
    }
  }, [templateImg, placeholderImg, template]);

  const drawComposite = () => {
    const canvas = canvasRef.current;
    if (!canvas || !templateImg) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    
    // Render at full resolution for quality
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // If placeholder exists, draw it clipped to frame
    if (placeholderImg) {
      const frameX = template.photo_frame_x * canvas.width;
      const frameY = template.photo_frame_y * canvas.height;
      const frameWidth = template.photo_frame_width * canvas.width;
      const frameHeight = template.photo_frame_height * canvas.height;

      ctx.save();
      ctx.beginPath();
      ctx.rect(frameX, frameY, frameWidth, frameHeight);
      ctx.clip();

      const scale = template.placeholder_scale || 1;
      const posX = template.placeholder_x || 0;
      const posY = template.placeholder_y || 0;

      const scaledWidth = placeholderImg.width * scale;
      const scaledHeight = placeholderImg.height * scale;

      // Calculate center of frame (same logic as PlaceholderEditor)
      const centerX = frameX + frameWidth / 2;
      const centerY = frameY + frameHeight / 2;

      // Position image centered, then apply offset
      const imgX = centerX - scaledWidth / 2 + posX;
      const imgY = centerY - scaledHeight / 2 + posY;

      ctx.drawImage(
        placeholderImg,
        imgX,
        imgY,
        scaledWidth,
        scaledHeight
      );
      ctx.restore();
    }

    // Draw template overlay
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
  };

  return (
    <canvas
      ref={canvasRef}
      className={`w-full h-full object-contain pointer-events-none ${className}`}
      style={{ imageRendering: "auto" }}
    />
  );
}
