import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { ZoomIn } from "lucide-react";

interface Template {
  image_url: string;
  format: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
}

interface PlaceholderEditorProps {
  template: Template;
  placeholderImage: string;
  initialScale?: number;
  initialX?: number;
  initialY?: number;
  onPositionChange: (x: number, y: number, scale: number) => void;
}

const FORMAT_DIMENSIONS: Record<string, { width: number; height: number }> = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  portrait: { width: 1080, height: 1350 },
  landscape: { width: 1200, height: 630 },
};

export const PlaceholderEditor = ({
  template,
  placeholderImage,
  initialScale = 1,
  initialX = 0,
  initialY = 0,
  onPositionChange,
}: PlaceholderEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [templateImg, setTemplateImg] = useState<HTMLImageElement | null>(null);
  const [placeholderImg, setPlaceholderImg] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(initialScale);
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  // Load template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setTemplateImg(img);
    img.src = template.image_url;
  }, [template.image_url]);

  // Load placeholder image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      setPlaceholderImg(img);
      
      // Auto-fit on first load if no initial scale
      if (initialScale === 1) {
        const dimensions = FORMAT_DIMENSIONS[template.format] || FORMAT_DIMENSIONS.square;
        const frameWidth = dimensions.width * template.photo_frame_width;
        const frameHeight = dimensions.height * template.photo_frame_height;
        
        const scaleX = frameWidth / img.width;
        const scaleY = frameHeight / img.height;
        const autoScale = Math.max(scaleX, scaleY);
        
        setScale(autoScale);
        onPositionChange(0, 0, autoScale);
      }
    };
    img.src = placeholderImage;
  }, [placeholderImage, template.format, template.photo_frame_width, template.photo_frame_height, initialScale, onPositionChange]);

  // Draw preview
  useEffect(() => {
    if (!canvasRef.current || !templateImg || !placeholderImg) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = FORMAT_DIMENSIONS[template.format] || FORMAT_DIMENSIONS.square;
    const containerWidth = canvas.offsetWidth;
    const aspectRatio = dimensions.height / dimensions.width;
    const displayHeight = containerWidth * aspectRatio;

    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${displayHeight}px`;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Calculate frame position and size
    const frameX = canvas.width * template.photo_frame_x;
    const frameY = canvas.height * template.photo_frame_y;
    const frameWidth = canvas.width * template.photo_frame_width;
    const frameHeight = canvas.height * template.photo_frame_height;

    // Save context and clip to frame
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameWidth, frameHeight);
    ctx.clip();

    // Draw placeholder image
    const scaledWidth = placeholderImg.width * scale;
    const scaledHeight = placeholderImg.height * scale;
    const centerX = frameX + frameWidth / 2;
    const centerY = frameY + frameHeight / 2;
    const imgX = centerX - scaledWidth / 2 + position.x;
    const imgY = centerY - scaledHeight / 2 + position.y;

    ctx.drawImage(placeholderImg, imgX, imgY, scaledWidth, scaledHeight);

    // Restore context
    ctx.restore();

    // Draw template overlay
    ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
  }, [templateImg, placeholderImg, template, scale, position]);

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    onPositionChange(newX, newY, scale);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const touch = e.touches[0];
    setIsDragging(true);
    setDragStart({ x: touch.clientX - position.x, y: touch.clientY - position.y });
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    setPosition({ x: newX, y: newY });
    onPositionChange(newX, newY, scale);
  };

  const handleScaleChange = (value: number[]) => {
    const newScale = value[0];
    setScale(newScale);
    onPositionChange(position.x, position.y, newScale);
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="text-sm text-muted-foreground text-center">
        Drag to position • Use slider to zoom
      </div>
      
      <canvas
        ref={canvasRef}
        className="w-full cursor-move touch-none rounded-lg"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleMouseUp}
      />

      <div className="flex items-center gap-3">
        <ZoomIn className="h-4 w-4 text-muted-foreground" />
        <Slider
          value={[scale]}
          onValueChange={handleScaleChange}
          min={0.5}
          max={3}
          step={0.1}
          className="flex-1"
        />
        <span className="text-sm text-muted-foreground min-w-[3rem] text-right">
          {Math.round(scale * 100)}%
        </span>
      </div>
    </Card>
  );
};
