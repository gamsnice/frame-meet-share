import type { DrawImageOptions, DrawTemplateOptions, FrameConfig, CanvasDimensions } from "./types";

/**
 * Clear the entire canvas
 */
export function clearCanvas(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  ctx.clearRect(0, 0, width, height);
}

/**
 * Set up canvas dimensions with optional device pixel ratio scaling
 */
export function setupCanvas(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  pixelRatio = 1
): CanvasRenderingContext2D | null {
  canvas.width = width * pixelRatio;
  canvas.height = height * pixelRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  
  const ctx = canvas.getContext("2d");
  if (ctx && pixelRatio !== 1) {
    ctx.scale(pixelRatio, pixelRatio);
  }
  return ctx;
}

/**
 * Calculate frame coordinates in canvas space
 */
export function calculateFrameCoordinates(
  frame: FrameConfig,
  canvasWidth: number,
  canvasHeight: number
): { x: number; y: number; width: number; height: number } {
  return {
    x: frame.x * canvasWidth,
    y: frame.y * canvasHeight,
    width: frame.width * canvasWidth,
    height: frame.height * canvasHeight,
  };
}

/**
 * Draw an image clipped to a rectangular frame
 */
export function drawClippedImage({
  ctx,
  image,
  frame,
  position,
  canvasDimensions,
  centered = true,
}: DrawImageOptions): void {
  const { x: frameX, y: frameY, width: frameWidth, height: frameHeight } = calculateFrameCoordinates(
    frame,
    canvasDimensions.width,
    canvasDimensions.height
  );

  ctx.save();
  ctx.beginPath();
  ctx.rect(frameX, frameY, frameWidth, frameHeight);
  ctx.clip();

  const scaledWidth = image.width * position.scale;
  const scaledHeight = image.height * position.scale;

  let imgX: number;
  let imgY: number;

  if (centered) {
    // Position from center of frame
    const centerX = frameX + frameWidth / 2;
    const centerY = frameY + frameHeight / 2;
    imgX = centerX - scaledWidth / 2 + position.x;
    imgY = centerY - scaledHeight / 2 + position.y;
  } else {
    // Position from frame origin
    imgX = frameX + position.x;
    imgY = frameY + position.y;
  }

  ctx.drawImage(image, imgX, imgY, scaledWidth, scaledHeight);
  ctx.restore();
}

/**
 * Draw template overlay on canvas
 */
export function drawTemplateOverlay({ ctx, templateImage, canvasDimensions }: DrawTemplateOptions): void {
  ctx.drawImage(templateImage, 0, 0, canvasDimensions.width, canvasDimensions.height);
}

/**
 * Draw a complete composite (user image + template overlay)
 */
export function drawComposite(
  ctx: CanvasRenderingContext2D,
  userImage: HTMLImageElement,
  templateImage: HTMLImageElement,
  frame: FrameConfig,
  position: { x: number; y: number; scale: number },
  canvasDimensions: CanvasDimensions,
  centered = false
): void {
  // Clear canvas
  clearCanvas(ctx, canvasDimensions.width, canvasDimensions.height);

  // Draw user image clipped to frame
  drawClippedImage({
    ctx,
    image: userImage,
    frame,
    position,
    canvasDimensions,
    centered,
  });

  // Draw template overlay
  drawTemplateOverlay({ ctx, templateImage, canvasDimensions });
}

/**
 * Create an offscreen canvas for export
 */
export function createExportCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Download canvas as image file
 */
export function downloadCanvas(canvas: HTMLCanvasElement, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = canvas.toDataURL("image/png");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
