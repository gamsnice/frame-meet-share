import { useRef, useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

interface PhotoFrameMapperProps {
  imageUrl: string;
  initialFrame: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  onFrameChange: (x: number, y: number, width: number, height: number) => void;
}

export default function PhotoFrameMapper({ imageUrl, initialFrame, onFrameChange }: PhotoFrameMapperProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [frame, setFrame] = useState(initialFrame);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => setImage(img);
    img.src = imageUrl;
  }, [imageUrl]);

  useEffect(() => {
    if (image && canvasRef.current) {
      drawCanvas();
    }
  }, [image, frame]);

  const drawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas || !image) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas size to match container
    const container = canvas.parentElement;
    if (!container) return;

    const maxWidth = container.clientWidth;
    const scale = maxWidth / image.width;
    canvas.width = maxWidth;
    canvas.height = image.height * scale;

    // Draw image
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

    // Draw semi-transparent overlay
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Calculate frame position in canvas coordinates
    const frameX = frame.x * canvas.width;
    const frameY = frame.y * canvas.height;
    const frameWidth = frame.width * canvas.width;
    const frameHeight = frame.height * canvas.height;

    // Clear frame area (show image)
    ctx.clearRect(frameX, frameY, frameWidth, frameHeight);
    ctx.drawImage(image, frameX / scale, frameY / scale, frameWidth / scale, frameHeight / scale, frameX, frameY, frameWidth, frameHeight);

    // Draw frame border
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 3;
    ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

    // Draw resize handle
    ctx.fillStyle = "#2563EB";
    ctx.fillRect(frameX + frameWidth - 10, frameY + frameHeight - 10, 10, 10);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    const frameX = frame.x;
    const frameY = frame.y;
    const frameWidth = frame.width;
    const frameHeight = frame.height;

    // Check if clicking resize handle
    const handleX = frameX + frameWidth;
    const handleY = frameY + frameHeight;
    if (Math.abs(x - handleX) < 0.02 && Math.abs(y - handleY) < 0.02) {
      setIsResizing(true);
      setDragStart({ x, y });
      return;
    }

    // Check if clicking inside frame
    if (x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight) {
      setIsDragging(true);
      setDragStart({ x: x - frameX, y: y - frameY });
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || (!isDragging && !isResizing)) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / canvas.width;
    const y = (e.clientY - rect.top) / canvas.height;

    if (isResizing) {
      let newWidth = x - frame.x;
      let newHeight = y - frame.y;

      // Enforce minimum size
      newWidth = Math.max(0.1, Math.min(newWidth, 1 - frame.x));
      newHeight = Math.max(0.1, Math.min(newHeight, 1 - frame.y));

      const newFrame = { ...frame, width: newWidth, height: newHeight };
      setFrame(newFrame);
      onFrameChange(newFrame.x, newFrame.y, newFrame.width, newFrame.height);
    } else if (isDragging) {
      let newX = x - dragStart.x;
      let newY = y - dragStart.y;

      // Keep frame within bounds
      newX = Math.max(0, Math.min(newX, 1 - frame.width));
      newY = Math.max(0, Math.min(newY, 1 - frame.height));

      const newFrame = { ...frame, x: newX, y: newY };
      setFrame(newFrame);
      onFrameChange(newFrame.x, newFrame.y, newFrame.width, newFrame.height);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  return (
    <Card className="p-4">
      <Label className="mb-2 block">Photo Frame Mapping</Label>
      <p className="text-sm text-muted-foreground mb-4">
        Drag the blue rectangle to define where participant photos will appear. Drag the bottom-right corner to resize.
      </p>
      <div className="border rounded-lg overflow-hidden bg-muted">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="w-full cursor-move"
        />
      </div>
      <div className="grid grid-cols-4 gap-2 mt-4 text-xs">
        <div>
          <span className="text-muted-foreground">X:</span> {(frame.x * 100).toFixed(1)}%
        </div>
        <div>
          <span className="text-muted-foreground">Y:</span> {(frame.y * 100).toFixed(1)}%
        </div>
        <div>
          <span className="text-muted-foreground">W:</span> {(frame.width * 100).toFixed(1)}%
        </div>
        <div>
          <span className="text-muted-foreground">H:</span> {(frame.height * 100).toFixed(1)}%
        </div>
      </div>
    </Card>
  );
}
