import { RefObject } from "react";
import { Move } from "lucide-react";

interface EditorCanvasProps {
  canvasRef: RefObject<HTMLCanvasElement>;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLCanvasElement>) => void;
  isMobile?: boolean;
}

export function EditorCanvas({
  canvasRef,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
  isMobile = false,
}: EditorCanvasProps) {
  if (isMobile) {
    return (
      <>
        <div
          className="border border-primary/20 rounded-lg overflow-hidden bg-muted"
          style={{ touchAction: "pan-y" }}
        >
          <canvas
            ref={canvasRef}
            onMouseDown={onMouseDown}
            onMouseMove={onMouseMove}
            onMouseUp={onMouseUp}
            onMouseLeave={onMouseUp}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onMouseUp}
            className="w-full cursor-move"
            style={{ display: "block", touchAction: "none" }}
          />
        </div>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground bg-muted/50 rounded p-1.5">
          <Move className="h-3 w-3 flex-shrink-0" />
          <span>Drag to position • Pinch or use slider to zoom</span>
        </div>
      </>
    );
  }

  return (
    <div className="max-w-sm mx-auto">
      <div className="border-2 border-primary/20 rounded-lg overflow-hidden bg-muted">
        <canvas
          ref={canvasRef}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onMouseUp}
          className="w-full cursor-move touch-none"
          style={{ display: "block" }}
        />
      </div>
      <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-lg p-2 mt-3">
        <Move className="h-3 w-3" />
        <span>Drag to position • Zoom to adjust</span>
      </div>
    </div>
  );
}
