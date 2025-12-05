import { Slider } from "@/components/ui/slider";
import { ZoomIn } from "lucide-react";

interface ZoomControlsProps {
  scale: number;
  initialScale: number;
  onScaleChange: (value: number[]) => void;
  isMobile?: boolean;
}

export function ZoomControls({
  scale,
  initialScale,
  onScaleChange,
  isMobile = false,
}: ZoomControlsProps) {
  if (isMobile) {
    return (
      <div>
        <label className="text-[11px] font-medium mb-1 flex items-center gap-1">
          <ZoomIn className="h-3 w-3" />
          Zoom: {scale.toFixed(1)}x
        </label>
        <Slider
          value={[scale]}
          onValueChange={onScaleChange}
          min={initialScale}
          max={initialScale * 3}
          step={0.1}
          className="mt-1"
        />
      </div>
    );
  }

  return (
    <div>
      <label className="text-xs font-medium mb-1 flex items-center gap-1.5">
        <ZoomIn className="h-3 w-3" />
        Zoom
      </label>
      <Slider
        value={[scale]}
        onValueChange={onScaleChange}
        min={initialScale}
        max={initialScale * 3}
        step={0.1}
        className="mt-1"
      />
    </div>
  );
}
