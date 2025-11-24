import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Upload, Download, ZoomIn } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  format: string;
  image_url: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
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
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      onImageUpload(dataUrl);
      setScale(1);
      setPosition({ x: 0, y: 0 });
    };
    reader.readAsDataURL(file);
  };

  const handleDownloadClick = () => {
    if (!userImage || !canvasRef.current) return;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const canvas = document.createElement("canvas");
    canvas.width = dimensions.width;
    canvas.height = dimensions.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Draw user image in frame area
    const frameX = template.photo_frame_x * dimensions.width;
    const frameY = template.photo_frame_y * dimensions.height;
    const frameWidth = template.photo_frame_width * dimensions.width;
    const frameHeight = template.photo_frame_height * dimensions.height;

    const img = new Image();
    img.onload = () => {
      ctx.save();
      ctx.rect(frameX, frameY, frameWidth, frameHeight);
      ctx.clip();
      
      const scaledWidth = frameWidth * scale;
      const scaledHeight = (img.height / img.width) * scaledWidth;
      ctx.drawImage(img, frameX + position.x, frameY + position.y, scaledWidth, scaledHeight);
      ctx.restore();

      // Draw template overlay
      const templateImg = new Image();
      templateImg.crossOrigin = "anonymous";
      templateImg.onload = () => {
        ctx.drawImage(templateImg, 0, 0, dimensions.width, dimensions.height);
        
        // Download
        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${eventSlug}-${template.name.replace(/\s+/g, "-").toLowerCase()}.png`;
            a.click();
            URL.revokeObjectURL(url);
            toast.success("Visual downloaded!");
            onDownload();
          }
        }, "image/png");
      };
      templateImg.src = template.image_url;
    };
    img.src = userImage;
  };

  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Create Your Visual</h2>
      
      {helperText && (
        <p className="text-sm text-muted-foreground mb-4">{helperText}</p>
      )}

      {!userImage ? (
        <div className="border-2 border-dashed rounded-lg p-12 text-center">
          <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground mb-4">Upload your photo</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
          <Button onClick={() => fileInputRef.current?.click()}>
            Choose Photo
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="border rounded-lg overflow-hidden bg-muted aspect-square">
            <canvas ref={canvasRef} className="w-full h-full" />
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 flex items-center gap-2">
                <ZoomIn className="h-4 w-4" />
                Zoom
              </label>
              <Slider
                value={[scale]}
                onValueChange={([v]) => setScale(v)}
                min={1}
                max={3}
                step={0.1}
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={() => fileInputRef.current?.click()} variant="outline" className="flex-1">
                Change Photo
              </Button>
              <Button onClick={handleDownloadClick} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Download Visual
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
