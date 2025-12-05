import { useState, useCallback, RefObject } from "react";
import { FORMAT_DIMENSIONS, type Template } from "@/types";

interface Position {
  x: number;
  y: number;
}

interface UseImageDraggingProps {
  template: Template;
  userImageElement: HTMLImageElement | null;
  canvasRef: RefObject<HTMLCanvasElement>;
  scale: number;
  initialScale: number;
  position: Position;
  previewQuality: number;
  setScale: (scale: number) => void;
  setPosition: (position: Position) => void;
}

interface UseImageDraggingReturn {
  isDragging: boolean;
  handleMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  handleMouseUp: () => void;
  handleTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  handleTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  handleScaleChange: (values: number[]) => void;
}

export function useImageDragging({
  template,
  userImageElement,
  canvasRef,
  scale,
  initialScale,
  position,
  previewQuality,
  setScale,
  setPosition,
}: UseImageDraggingProps): UseImageDraggingReturn {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<Position>({ x: 0, y: 0 });
  const [pinchStartDistance, setPinchStartDistance] = useState<number | null>(null);
  const [pinchStartScale, setPinchStartScale] = useState<number>(1);

  const getTouchDistance = (touch1: React.Touch, touch2: React.Touch) => {
    return Math.hypot(touch1.clientX - touch2.clientX, touch1.clientY - touch2.clientY);
  };

  const getFrameParams = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    
    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const frameX = template.photo_frame_x * canvas.width;
    const frameY = template.photo_frame_y * canvas.height;
    const frameWidth = template.photo_frame_width * canvas.width;
    const frameHeight = template.photo_frame_height * canvas.height;
    const displayScale = canvas.width / dimensions.width;
    
    return { frameX, frameY, frameWidth, frameHeight, displayScale, dimensions };
  }, [canvasRef, template]);

  const constrainPosition = useCallback((newX: number, newY: number, currentScale: number) => {
    if (!userImageElement) return { x: newX, y: newY };
    
    const dimensions = FORMAT_DIMENSIONS[template.format as keyof typeof FORMAT_DIMENSIONS];
    const frameWidth = template.photo_frame_width * dimensions.width;
    const frameHeight = template.photo_frame_height * dimensions.height;
    const scaledUserWidth = userImageElement.width * currentScale;
    const scaledUserHeight = userImageElement.height * currentScale;
    
    return {
      x: Math.min(0, Math.max(newX, frameWidth - scaledUserWidth)),
      y: Math.min(0, Math.max(newY, frameHeight - scaledUserHeight)),
    };
  }, [template, userImageElement]);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!userImageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * previewQuality;
    const y = (e.clientY - rect.top) * previewQuality;

    const params = getFrameParams();
    if (!params) return;
    
    const { frameX, frameY, frameWidth, frameHeight, displayScale } = params;

    // Check if click is inside frame
    if (x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight) {
      setIsDragging(true);
      setDragStart({
        x: x - frameX - position.x * displayScale,
        y: y - frameY - position.y * displayScale,
      });
    }
  }, [canvasRef, getFrameParams, position, previewQuality, userImageElement]);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !userImageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) * previewQuality;
    const y = (e.clientY - rect.top) * previewQuality;

    const params = getFrameParams();
    if (!params) return;
    
    const { frameX, frameY, frameWidth, frameHeight, displayScale } = params;

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
  }, [canvasRef, dragStart, getFrameParams, isDragging, previewQuality, scale, setPosition, userImageElement]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
    setPinchStartDistance(null);
  }, []);

  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pinch-to-zoom: 2 fingers
    if (e.touches.length === 2) {
      const distance = getTouchDistance(e.touches[0], e.touches[1]);
      setPinchStartDistance(distance);
      setPinchStartScale(scale);
      return;
    }

    // Single finger drag
    if (e.touches.length !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * previewQuality;
    const y = (touch.clientY - rect.top) * previewQuality;

    const params = getFrameParams();
    if (!params) return;
    
    const { frameX, frameY, frameWidth, frameHeight, displayScale } = params;

    if (x >= frameX && x <= frameX + frameWidth && y >= frameY && y <= frameY + frameHeight) {
      setIsDragging(true);
      setDragStart({
        x: x - frameX - position.x * displayScale,
        y: y - frameY - position.y * displayScale,
      });
    }
  }, [canvasRef, getFrameParams, position, previewQuality, scale, userImageElement]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!userImageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // Pinch-to-zoom: 2 fingers
    if (e.touches.length === 2 && pinchStartDistance !== null) {
      e.preventDefault();
      const newDistance = getTouchDistance(e.touches[0], e.touches[1]);
      const scaleRatio = newDistance / pinchStartDistance;
      const newScale = Math.max(initialScale, Math.min(pinchStartScale * scaleRatio, initialScale * 3));

      setScale(newScale);

      // Adjust position to keep image constrained
      const constrained = constrainPosition(position.x, position.y, newScale);
      setPosition(constrained);
      return;
    }

    // Single finger drag
    if (!isDragging || e.touches.length !== 1) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = (touch.clientX - rect.left) * previewQuality;
    const y = (touch.clientY - rect.top) * previewQuality;

    const params = getFrameParams();
    if (!params) return;
    
    const { frameX, frameY, frameWidth, frameHeight, displayScale } = params;

    let newX = (x - frameX - dragStart.x) / displayScale;
    let newY = (y - frameY - dragStart.y) / displayScale;

    const scaledUserWidth = userImageElement.width * scale;
    const scaledUserHeight = userImageElement.height * scale;
    const actualFrameWidth = frameWidth / displayScale;
    const actualFrameHeight = frameHeight / displayScale;

    newX = Math.min(0, Math.max(newX, actualFrameWidth - scaledUserWidth));
    newY = Math.min(0, Math.max(newY, actualFrameHeight - scaledUserHeight));

    setPosition({ x: newX, y: newY });
  }, [canvasRef, constrainPosition, dragStart, getFrameParams, initialScale, isDragging, pinchStartDistance, pinchStartScale, position, previewQuality, scale, setPosition, setScale, userImageElement]);

  const handleScaleChange = useCallback((values: number[]) => {
    const newScale = values[0];
    setScale(newScale);

    // Adjust position to keep image constrained
    const constrained = constrainPosition(position.x, position.y, newScale);
    setPosition(constrained);
  }, [constrainPosition, position, setPosition, setScale]);

  return {
    isDragging,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    handleTouchStart,
    handleTouchMove,
    handleScaleChange,
  };
}
