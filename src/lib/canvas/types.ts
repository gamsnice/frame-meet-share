export interface FrameConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

export interface CanvasDimensions {
  width: number;
  height: number;
}

export interface DrawImageOptions {
  ctx: CanvasRenderingContext2D;
  image: HTMLImageElement;
  frame: FrameConfig;
  position: ImagePosition;
  canvasDimensions: CanvasDimensions;
  centered?: boolean;
}

export interface DrawTemplateOptions {
  ctx: CanvasRenderingContext2D;
  templateImage: HTMLImageElement;
  canvasDimensions: CanvasDimensions;
}
