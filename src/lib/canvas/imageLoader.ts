/**
 * Load an image with cross-origin support
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
    img.src = src;
  });
}

/**
 * Load multiple images in parallel
 */
export async function loadImages(sources: string[]): Promise<HTMLImageElement[]> {
  return Promise.all(sources.map(loadImage));
}

/**
 * Create a data URL from a canvas
 */
export function canvasToDataUrl(canvas: HTMLCanvasElement, type = "image/png", quality = 1): string {
  return canvas.toDataURL(type, quality);
}

/**
 * Create a blob from a canvas
 */
export function canvasToBlob(canvas: HTMLCanvasElement, type = "image/png", quality = 1): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error("Failed to create blob from canvas"));
        }
      },
      type,
      quality
    );
  });
}

/**
 * Calculate auto-fit scale for an image within a frame
 */
export function calculateAutoFitScale(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  mode: "cover" | "contain" = "cover"
): number {
  const scaleX = frameWidth / imageWidth;
  const scaleY = frameHeight / imageHeight;
  
  return mode === "cover" 
    ? Math.max(scaleX, scaleY) 
    : Math.min(scaleX, scaleY);
}
