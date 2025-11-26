import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, ZoomIn, Move } from "lucide-react";
import { toast } from "sonner";
import TemplatePreview from "./TemplatePreview";

interface Template {
  id: string;
  name: string;
  format: string;
  image_url: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
  placeholder_image_url?: string;
  placeholder_scale?: number;
  placeholder_x?: number;
  placeholder_y?: number;
}

interface ImageEditorProps {
  template: Template;
  userImage: string | null;
  onImageUpload: (imageDataUrl: string) => void;
  onDownload: () => void;
  helperText?: string;
  eventSlug: string;
}

const FORMAT_DIMENSIONS = {
  square: { width: 1080, height: 1080 },
  story: { width: 1080, height: 1920 },
  landscape: { width: 1200, height: 630 },
  portrait: { width: 1080, height: 1350 },
};

export default function ImageEditor({
  template,
  userImage,
  onImageUpload,
  onDownload,
  helperText,
  eventSlug,
}: ImageEditorProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImageElement, setUserImageElement] = useState<HTMLImageElement | null>(null);
  const [templateImageElement, setTemplateImageElement] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);

  // Load template image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setTemplateImageElement(img);
    img.onerror = () => {
      console.error("Failed to load template image");
      toast.error("Failed to load template");
    };
    img.src = template.image_url;
  }, [template.image_url]);

  // Load user image
  useEffect(() => {
    if (userImage) {
      const img = new Image();
      img.onload = () => {
        setUserImageElement(img);
        
        // Calculate initial scale to fill frame
        const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
        const frameWidth = template.photo_frame_width * dimensions.width;
        const frameHeight = template.photo_frame_height * dimensions.height;
        
        const scaleToFitWidth = frameWidth / img.width;
        const scaleToFitHeight = frameHeight / img.height;
        const minScale = Math.max(scaleToFitWidth, scaleToFitHeight);
        
        setInitialScale(minScale);
        setScale(minScale);
        
        // Center the image
        const scaledWidth = img.width * minScale;
        const scaledHeight = img.height * minScale;
        setPosition({
          x: (frameWidth - scaledWidth) / 2,
          y: (frameHeight - scaledHeight) / 2,
        });
      };
      img.src = userImage;
    } else {
      setUserImageElement(null);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    }
  }, [userImage, template]);

  // Draw preview
  useEffect(() => {
    if (previewCanvasRef.current && templateImageElement && userImageElement) {
      drawPreview();
    }
  }, [templateImageElement, userImageElement, scale, position]);

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !templateImageElement || !userImageElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    
    // Set canvas to display size (fit container)
    const container = canvas.parentElement;
    if (!container) return;
    
    const containerWidth = container.clientWidth;
    const displayScale = containerWidth / dimensions.width;
    
    canvas.width = containerWidth;
    canvas.height = dimensions.height * displayScale;

    // Calculate frame position on canvas
    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw user image clipped to frame
    ctx.save();
    ctx.beginPath();
    ctx.rect(frameX, frameY, frameWidth, frameHeight);
    ctx.clip();
    
    const scaledUserWidth = userImageElement.width * scale * displayScale;
    const scaledUserHeight = userImageElement.height * scale * displayScale;
    
    ctx.drawImage(
      userImageElement,
      frameX + position.x * displayScale,
      frameY + position.y * displayScale,
      scaledUserWidth,
      scaledUserHeight
    );
    ctx.restore();

    // Draw template overlay
    ctx.drawImage(templateImageElement, 0, 0, canvas.width, canvas.height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImageElement) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;

    // Check if click is inside frame
    if (x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight) {
      setIsDragging(true);
      
      const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
      const displayScale = canvas.width / dimensions.width;
      
      setDragStart({
        x: x - frameX - position.x * displayScale,
        y: y - frameY - position.y * displayScale,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !userImageElement) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const displayScale = canvas.width / dimensions.width;

    let newX = (x - frameX - dragStart.x) / displayScale;
    let newY = (y - frameY - dragStart.y) / displayScale;

    // Constrain to keep frame filled
    const scaledUserWidth = userImageElement.width * scale;
    const scaledUserHeight = userImageElement.height * scale;
    const actualFrameWidth = frameWidth / displayScale;
    const actualFrameHeight = frameHeight / displayScale;

    newX = Math.min(0, Math.max(newX, actualFrameWidth - scaledUserWidth));
    newY = Math.min(0, Math.max(newY, actualFrameHeight - scaledUserHeight));

    setPosition({ x: newX, y: newY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImageElement || e.touches.length !== 1) return;
    
    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;

    if (x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight) {
      setIsDragging(true);
      
      const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
      const displayScale = canvas.width / dimensions.width;
      
      setDragStart({
        x: x - frameX - position.x * displayScale,
        y: y - frameY - position.y * displayScale,
      });
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDragging || !userImageElement || e.touches.length !== 1) return;

    const canvas = previewCanvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;

    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const displayScale = canvas.width / dimensions.width;

    let newX = (x - frameX - dragStart.x) / displayScale;
    let newY = (y - frameY - dragStart.y) / displayScale;

    const scaledUserWidth = userImageElement.width * scale;
    const scaledUserHeight = userImageElement.height * scale;
    const actualFrameWidth = frameWidth / displayScale;
    const actualFrameHeight = frameHeight / displayScale;

    newX = Math.min(0, Math.max(newX, actualFrameWidth - scaledUserWidth));
    newY = Math.min(0, Math.max(newY, actualFrameHeight - scaledUserHeight));

    setPosition({ x: newX, y: newY });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image too large. Please use an image under 10MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageUpload(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadClick = () => {
    if (!userImageElement || !templateImageElement) {
      toast.error("Please upload a photo first");
      return;
    }

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

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

    ctx.drawImage(
      userImageElement,
      frameX + position.x,
      frameY + position.y,
      scaledUserWidth,
      scaledUserHeight
    );
    ctx.restore();

    // Draw template overlay
    ctx.drawImage(templateImageElement, 0, 0, dimensions.width, dimensions.height);

    // Download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        const filename = `${eventSlug}-${template.name.replace(/\s+/g, "-").toLowerCase()}-meetme.png`;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Visual downloaded! Time to post 🎉");
        onDownload();
      }
    }, "image/png", 1.0);
  };

  const handleScaleChange = (values: number[]) => {
    const newScale = values[0];
    setScale(newScale);

    // Adjust position to keep image constrained
    if (userImageElement) {
      const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
      const frameWidth = template.photo_frame_width * dimensions.width;
      const frameHeight = template.photo_frame_height * dimensions.height;

      const scaledUserWidth = userImageElement.width * newScale;
      const scaledUserHeight = userImageElement.height * newScale;

      let newX = position.x;
      let newY = position.y;

      newX = Math.min(0, Math.max(newX, frameWidth - scaledUserWidth));
      newY = Math.min(0, Math.max(newY, frameHeight - scaledUserHeight));

      setPosition({ x: newX, y: newY });
    }
  };

  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Create Your Visual</h2>

      {helperText && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-primary leading-tight">{helperText}</p>
        </div>
      )}

      {!userImage ? (
        <div className="relative group">
          <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted">
            <TemplatePreview template={template} className="w-full" />
          </div>
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="text-center">
              <Upload className="h-10 w-10 mx-auto text-primary mb-2" />
              <Button 
                onClick={() => fileInputRef.current?.click()}
                className="shadow-lg"
              >
                Upload Your Photo
              </Button>
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-3">
          <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted">
            <canvas
              ref={previewCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleMouseUp}
              className="w-full cursor-move touch-none"
              style={{ display: "block" }}
            />
          </div>

          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
            <Move className="h-3 w-3" />
            <span>Drag to position • Zoom to adjust</span>
          </div>

          <div className="space-y-2">
            <div>
              <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
                <ZoomIn className="h-3 w-3" />
                Zoom: {scale.toFixed(1)}x
              </label>
              <Slider
                value={[scale]}
                onValueChange={handleScaleChange}
                min={initialScale}
                max={initialScale * 3}
                step={0.1}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="outline"
                size="sm"
                className="flex-1"
              >
                Change Photo
              </Button>
              <Button onClick={handleDownloadClick} size="sm" className="flex-1">
                <Download className="mr-1.5 h-3.5 w-3.5" />
                Download
              </Button>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}
    </Card>
  );
}
