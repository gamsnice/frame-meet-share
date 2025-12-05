import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Upload,
  Download,
  ZoomIn,
  Move,
  Instagram,
  Linkedin,
  Share2,
  ArrowLeft,
  Save,
  FileDown,
  Copy,
  Lightbulb,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { toast } from "sonner";
import TemplatePreview from "./TemplatePreview";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer";
import { FORMAT_DIMENSIONS, type Template } from "@/types";
import { useImageDragging } from "@/hooks/useImageDragging";
import { useImageExport } from "@/hooks/useImageExport";
import { useCaptions } from "@/hooks/useCaptions";

interface ImageEditorProps {
  template: Template;
  userImage: string | null;
  onImageUpload: (imageDataUrl: string) => void;
  onDownload: () => void;
  onResetTemplate?: () => void;
  helperText?: string;
  eventSlug: string;
  eventId?: string;
  isMobile?: boolean;
}

export default function ImageEditor({
  template,
  userImage,
  onImageUpload,
  onDownload,
  onResetTemplate,
  helperText,
  eventSlug,
  eventId,
  isMobile = false,
}: ImageEditorProps) {
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [userImageElement, setUserImageElement] = useState<HTMLImageElement | null>(null);
  const [templateImageElement, setTemplateImageElement] = useState<HTMLImageElement | null>(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [initialScale, setInitialScale] = useState(1);
  const [isDownloadDrawerOpen, setIsDownloadDrawerOpen] = useState(false);

  // Dynamic preview quality: higher on mobile / high-DPI screens
  const devicePixelRatioSafe = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const previewQuality = isMobile
    ? Math.min(devicePixelRatioSafe * 1.2, 3)
    : Math.min(devicePixelRatioSafe, 2);

  // Use extracted hooks
  const { captions, captionsExpanded, setCaptionsExpanded, copyCaption } = useCaptions({
    templateId: template.id,
    eventId,
    isMobile,
  });

  const {
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleScaleChange,
  } = useImageDragging({
    template,
    userImageElement,
    canvasRef: previewCanvasRef,
    scale,
    initialScale,
    position,
    previewQuality,
    setScale,
    setPosition,
  });

  const { handleDownloadAsFile, handleSaveToPhotos, handleDownloadClick } = useImageExport({
    template,
    userImageElement,
    templateImageElement,
    scale,
    position,
    eventSlug,
    onDownload,
    setIsDownloadDrawerOpen,
  });

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

        const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
        const frameWidth = template.photo_frame_width * dimensions.width;
        const frameHeight = template.photo_frame_height * dimensions.height;

        const scaleToFitWidth = frameWidth / img.width;
        const scaleToFitHeight = frameHeight / img.height;
        const minScale = Math.max(scaleToFitWidth, scaleToFitHeight);

        setInitialScale(minScale);
        setScale(minScale);

        // Center image within the frame
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
  }, [templateImageElement, userImageElement, scale, position, previewQuality]);

  const drawPreview = () => {
    const canvas = previewCanvasRef.current;
    if (!canvas || !templateImageElement || !userImageElement) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];

    // Get container size
    const container = canvas.parentElement;
    if (!container) return;

    const containerWidth = container.clientWidth;
    const containerHeight = containerWidth * (dimensions.height / dimensions.width);

    // Set canvas size with quality multiplier for better resolution
    canvas.width = containerWidth * previewQuality;
    canvas.height = containerHeight * previewQuality;

    // Set display size via CSS
    canvas.style.width = `${containerWidth}px`;
    canvas.style.height = `${containerHeight}px`;

    // Calculate frame position at canvas resolution
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

    // Scale the user image according to canvas size
    const scaledUserWidth = userImageElement.width * scale * (canvas.width / dimensions.width);
    const scaledUserHeight = userImageElement.height * scale * (canvas.height / dimensions.height);

    ctx.drawImage(
      userImageElement,
      frameX + position.x * (canvas.width / dimensions.width),
      frameY + position.y * (canvas.height / dimensions.height),
      scaledUserWidth,
      scaledUserHeight,
    );
    ctx.restore();

    // Draw template image over the user image
    ctx.drawImage(templateImageElement, 0, 0, canvas.width, canvas.height);
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

  // Resize handling
  useEffect(() => {
    const handleResize = () => {
      drawPreview();
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [previewQuality]);

  // Captions Section Component
  const CaptionsSection = () => {
    if (captions.length === 0) return null;

    if (isMobile) {
      return (
        <div className="border border-border rounded-lg p-3">
          <button
            onClick={() => setCaptionsExpanded(!captionsExpanded)}
            className="w-full flex items-center justify-between text-left"
          >
            <div className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Caption Ideas</span>
              <span className="text-[10px] text-muted-foreground">({captions.length})</span>
            </div>
            {captionsExpanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </button>

          {captionsExpanded && (
            <div className="mt-3 space-y-2">
              {captions.map((caption) => (
                <div key={caption.id} className="flex items-start gap-2 p-2 bg-muted rounded-lg">
                  <p className="flex-1 text-xs whitespace-pre-wrap leading-relaxed">{caption.caption_text}</p>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => copyCaption(caption.caption_text)}
                    className="shrink-0 h-7 w-7 p-0"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      );
    }

    // Desktop captions
    return (
      <div className="border border-border rounded-lg p-4">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-primary" />
          Caption Ideas
        </h3>
        <div className="space-y-2">
          {captions.map((caption) => (
            <div key={caption.id} className="flex items-start gap-3 p-2 bg-muted rounded-lg">
              <p className="flex-1 text-sm whitespace-pre-wrap">{caption.caption_text}</p>
              <Button size="sm" variant="ghost" onClick={() => copyCaption(caption.caption_text)} className="shrink-0">
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Mobile Layout
  if (isMobile) {
    return (
      <Card className="p-3">
        <h2 className="text-base font-medium mb-2">Create Your Visual</h2>

        {helperText && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mb-2">
            <p className="text-[11px] text-primary leading-tight">{helperText}</p>
          </div>
        )}

        {!userImage ? (
          <div className="relative">
            <div className="border border-primary/20 rounded-lg overflow-hidden bg-muted">
              <TemplatePreview template={template} className="w-full" />
            </div>
            <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] rounded-lg flex items-center justify-center">
              <Button
                size="lg"
                className="shadow-lg min-h-[48px] text-base px-6"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="h-5 w-5 mr-2" />
                Add Your Photo
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        ) : (
          <div className="space-y-2">
            <div
              className="border border-primary/20 rounded-lg overflow-hidden bg-muted"
              style={{ touchAction: "pan-y" }}
            >
              <canvas
                ref={previewCanvasRef}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleMouseUp}
                className="w-full cursor-move"
                style={{ display: "block", touchAction: "none" }}
              />
            </div>

            <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
              <Move className="h-3 w-3 flex-shrink-0" />
              <span>Drag to position • Pinch or use slider to zoom</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-[11px] font-medium mb-1 flex items-center gap-1">
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
                  className="flex-1 min-h-[40px] text-xs"
                >
                  Change Photo
                </Button>
                <Button onClick={() => handleDownloadClick(isMobile)} size="sm" className="flex-1 min-h-[40px] text-xs">
                  <Download className="h-3.5 w-3.5 mr-1" />
                  Download
                </Button>
                {onResetTemplate && (
                  <Button onClick={onResetTemplate} variant="ghost" size="sm" className="min-h-[40px] text-xs px-3">
                    <ArrowLeft className="h-3 w-3" />
                  </Button>
                )}
              </div>

              {/* Social Share Section for Mobile */}
              <div id="social-share" className="pt-3 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-3.5 w-3.5 text-muted-foreground" />
                  <p className="text-[10px] font-medium text-muted-foreground">Share on social media</p>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    onClick={() => window.open("https://www.linkedin.com/feed/", "_blank")}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#0077B5]/10 to-[#0077B5]/5 border-[#0077B5]/30 hover:border-[#0077B5] hover:bg-[#0077B5]/10 transition-all min-h-[40px] text-xs"
                  >
                    <Linkedin className="h-3.5 w-3.5 text-[#0077B5]" />
                    <span>LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => window.open("https://www.instagram.com/", "_blank")}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-1.5 bg-gradient-to-r from-[#E4405F]/10 to-[#833AB4]/10 border-[#E4405F]/30 hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-all min-h-[40px] text-xs"
                  >
                    <Instagram className="h-3.5 w-3.5 text-[#E4405F]" />
                    <span>Instagram</span>
                  </Button>
                </div>
                <p className="text-[9px] text-muted-foreground text-center mt-1.5">
                  Download first, then upload to share
                </p>
              </div>

              <CaptionsSection />
            </div>

            <Drawer open={isDownloadDrawerOpen} onOpenChange={setIsDownloadDrawerOpen}>
              <DrawerContent>
                <DrawerHeader>
                  <DrawerTitle className="text-center">Save Your Visual</DrawerTitle>
                </DrawerHeader>
                <div className="p-4 pb-8 space-y-3">
                  <Button onClick={handleSaveToPhotos} className="w-full min-h-[56px] text-base justify-start gap-4">
                    <Save className="h-6 w-6" />
                    <div className="text-left">
                      <div className="font-medium">Save to Photos</div>
                      <div className="text-xs opacity-80">Add to your camera roll</div>
                    </div>
                  </Button>
                  <Button
                    onClick={handleDownloadAsFile}
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
          </div>
        )}
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Create Your Visual</h2>

      {helperText && (
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-2 mb-3">
          <p className="text-xs text-primary leading-tight">{helperText}</p>
        </div>
      )}

      {!userImage ? (
        <div className="max-w-sm mx-auto">
          <div className="relative group">
            <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted">
              <TemplatePreview template={template} className="w-full" />
            </div>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto text-primary mb-2" />
                <Button onClick={() => fileInputRef.current?.click()} className="shadow-lg">
                  Upload Your Photo
                </Button>
              </div>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-w-sm mx-auto">
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
          </div>

          <div className="max-w-sm mx-auto space-y-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2">
              <Move className="h-3 w-3" />
              <span>Drag to position • Zoom to adjust</span>
            </div>

            <div className="space-y-2">
              <div>
                <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
                  <ZoomIn className="h-3 w-3" />
                  Zoom
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

              <div className="flex flex-col sm:flex-row gap-2">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  size="sm"
                  className="flex-1 min-h-[44px]"
                >
                  Change Photo
                </Button>
                <Button onClick={() => handleDownloadClick(isMobile)} size="sm" className="flex-1 min-h-[44px]">
                  <Download className="mr-1.5 h-3.5 w-3.5" />
                  Download
                </Button>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-2 mb-2">
                  <Share2 className="h-4 w-4 text-muted-foreground" />
                  <p className="text-xs font-medium text-muted-foreground"></p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <Button
                    onClick={() => window.open("https://www.linkedin.com/feed/", "_blank")}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#0077B5]/10 to-[#0077B5]/5 border-[#0077B5]/30 hover:border-[#0077B5] hover:bg-[#0077B5]/10 transition-all"
                  >
                    <Linkedin className="h-4 w-4 text-[#0077B5]" />
                    <span className="font-medium">Share on LinkedIn</span>
                  </Button>
                  <Button
                    onClick={() => window.open("https://www.instagram.com/", "_blank")}
                    variant="outline"
                    size="sm"
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#E4405F]/10 to-[#833AB4]/10 border-[#E4405F]/30 hover:border-[#E4405F] hover:bg-[#E4405F]/10 transition-all"
                  >
                    <Instagram className="h-4 w-4 text-[#E4405F]" />
                    <span className="font-medium">Share on Instagram</span>
                  </Button>
                </div>
                <p className="text-[10px] text-muted-foreground text-center mt-2">
                  Download first, then upload to your preferred platform
                </p>
              </div>

              <CaptionsSection />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
