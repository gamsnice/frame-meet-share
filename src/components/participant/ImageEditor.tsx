import { useRef, useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";
import { toast } from "sonner";
import TemplatePreview from "./TemplatePreview";
import { FORMAT_DIMENSIONS, type Template } from "@/types";
import { useImageDragging } from "@/hooks/useImageDragging";
import { useImageExport } from "@/hooks/useImageExport";
import { useCaptions } from "@/hooks/useCaptions";
import {
  EditorCanvas,
  ZoomControls,
  ActionButtons,
  SocialShareButtons,
  CaptionsSection,
  DownloadDrawer,
} from "./image-editor";

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

  const { handleDownloadAsFile, handleSaveToPhotos, handleDownloadClick, isCheckingLimit } = useImageExport({
    template,
    userImageElement,
    templateImageElement,
    scale,
    position,
    eventSlug,
    eventId: eventId || '',
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

  const triggerFileUpload = () => fileInputRef.current?.click();

  // Helper text component
  const HelperTextBanner = () =>
    helperText ? (
      <div className={`bg-primary/10 border border-primary/20 rounded-lg p-2 ${isMobile ? "mb-2" : "mb-3"}`}>
        <p className={`text-primary leading-tight ${isMobile ? "text-[11px]" : "text-xs"}`}>{helperText}</p>
      </div>
    ) : null;

  // Upload overlay for when no image
  const UploadOverlay = () => (
    <div className="relative">
      <div className={`border ${isMobile ? "border-primary/20" : "border-2 border-primary/20"} rounded-lg overflow-hidden bg-muted`}>
        <TemplatePreview template={template} className="w-full" />
      </div>
      <div className={`absolute inset-0 ${isMobile ? "bg-background/60 backdrop-blur-[2px]" : "bg-background/70 backdrop-blur-sm"} rounded-lg flex items-center justify-center`}>
        {isMobile ? (
          <Button
            size="lg"
            className="shadow-lg min-h-[48px] text-base px-6"
            onClick={triggerFileUpload}
          >
            <Upload className="h-5 w-5 mr-2" />
            Add Your Photo
          </Button>
        ) : (
          <div className="text-center">
            <Upload className="h-10 w-10 mx-auto text-primary mb-2" />
            <Button onClick={triggerFileUpload} className="shadow-lg">
              Upload Your Photo
            </Button>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
    </div>
  );

  // Mobile Layout
  if (isMobile) {
    return (
      <Card className="p-3">
        <h2 className="text-base font-medium mb-2">Create Your Visual</h2>
        <HelperTextBanner />

        {!userImage ? (
          <UploadOverlay />
        ) : (
          <div className="space-y-2">
            <EditorCanvas
              canvasRef={previewCanvasRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              isMobile
            />

            <div className="space-y-2">
              <ZoomControls
                scale={scale}
                initialScale={initialScale}
                onScaleChange={handleScaleChange}
                isMobile
              />

              <ActionButtons
                onChangePhoto={triggerFileUpload}
                onDownload={() => handleDownloadClick(isMobile)}
                onResetTemplate={onResetTemplate}
                isMobile
              />

              <SocialShareButtons isMobile />

              <CaptionsSection
                captions={captions}
                captionsExpanded={captionsExpanded}
                onToggleExpand={() => setCaptionsExpanded(!captionsExpanded)}
                onCopyCaption={copyCaption}
                isMobile
              />
            </div>

            <DownloadDrawer
              open={isDownloadDrawerOpen}
              onOpenChange={setIsDownloadDrawerOpen}
              onSaveToPhotos={handleSaveToPhotos}
              onDownloadAsFile={handleDownloadAsFile}
            />

            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
          </div>
        )}
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card className="p-4">
      <h2 className="text-lg font-semibold mb-3">Create Your Visual</h2>
      <HelperTextBanner />

      {!userImage ? (
        <div className="max-w-sm mx-auto">
          <div className="relative group">
            <UploadOverlay />
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <EditorCanvas
            canvasRef={previewCanvasRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
          />

          <div className="max-w-sm mx-auto space-y-3">
            <div className="space-y-2">
              <ZoomControls
                scale={scale}
                initialScale={initialScale}
                onScaleChange={handleScaleChange}
              />

              <ActionButtons
                onChangePhoto={triggerFileUpload}
                onDownload={() => handleDownloadClick(isMobile)}
              />

              <SocialShareButtons />

              <CaptionsSection
                captions={captions}
                captionsExpanded={captionsExpanded}
                onToggleExpand={() => setCaptionsExpanded(!captionsExpanded)}
                onCopyCaption={copyCaption}
              />
            </div>
          </div>

          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      )}
    </Card>
  );
}
