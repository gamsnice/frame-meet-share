import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Camera } from "lucide-react";
import TemplatePreview from "./TemplatePreview";
import { Template, FORMAT_ASPECT_RATIOS } from "@/types";

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (template: Template) => void;
  onSelectWithUpload?: (template: Template, imageDataUrl: string) => void;
  isMobile?: boolean;
}

const FORMAT_LABELS = {
  square: "1:1",
  story: "9:16",
  landscape: "16:9",
  portrait: "4:5",
};

const FORMAT_LABELS_FULL = {
  square: "Square (1080x1080)",
  story: "Story (1080x1920)",
  landscape: "Landscape (1200x630)",
  portrait: "Portrait (1080x1350)",
};

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
  onSelectWithUpload,
  isMobile = false,
}: TemplateSelectorProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingTemplate, setPendingTemplate] = useState<Template | null>(null);

  const handleTemplateClick = (template: Template) => {
    if (onSelectWithUpload) {
      setPendingTemplate(template);
      fileInputRef.current?.click();
    } else {
      onSelect(template);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && pendingTemplate && onSelectWithUpload) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        onSelectWithUpload(pendingTemplate, dataUrl);
        setPendingTemplate(null);
      };
      reader.readAsDataURL(file);
    }
    // Reset input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  if (isMobile) {
    return (
      <Card className="p-3">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-medium">Choose Your Frame</h2>
          <span className="text-[10px] text-muted-foreground">{templates.length} available</span>
        </div>

        {/* Horizontal Carousel for Mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
          <div className="flex gap-2 pb-2" style={{ width: "max-content" }}>
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => handleTemplateClick(template)}
                  className={`relative rounded-lg border overflow-hidden transition-all flex-shrink-0 ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-lg ring-2 ring-primary/30"
                      : "border-border bg-card"
                  }`}
                  style={{ width: "140px" }}
                >
                  <div
                    className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} bg-muted overflow-hidden relative`}
                  >
                    <TemplatePreview template={template} />
                    {/* Add photo overlay */}
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 active:opacity-100 transition-opacity">
                      <span className="text-xs font-medium text-foreground bg-background/90 px-2 py-1 rounded-full border border-primary/30 shadow-sm flex items-center gap-1">
                        <Camera className="h-3 w-3" />
                        Add Photo
                      </span>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center shadow-md">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="p-1.5 bg-card/80 backdrop-blur-sm pointer-events-none">
                    <div className="flex items-center gap-1 justify-center">
                      <Badge variant="secondary" className="text-[9px] px-1.5 py-0 h-4 font-normal">
                        {template.type}
                      </Badge>
                      <Badge variant="outline" className="text-[9px] px-1 py-0 h-4 font-normal">
                        {FORMAT_LABELS[template.format as keyof typeof FORMAT_LABELS]}
                      </Badge>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <p className="text-xs text-primary font-medium text-center mt-2 py-1.5 bg-primary/10 rounded-full mx-2">
          👆 Tap a frame to add your photo
        </p>
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card className="p-6">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      <div className="mb-4">
        <h2 className="text-xl font-semibold">Choose Your Frame</h2>
        <p className="text-sm text-muted-foreground mt-1">Click on a frame to add your photo</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <div key={template.id} className="space-y-2">
              <button
                onClick={() => handleTemplateClick(template)}
                className={`group relative rounded-lg border-2 overflow-hidden transition-all w-full ${
                  isSelected 
                    ? "border-primary ring-2 ring-primary shadow-lg shadow-primary/20" 
                    : "border-border hover:border-primary/50 hover:shadow-md"
                }`}
              >
                <div
                  className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} bg-muted overflow-hidden relative`}
                >
                  <TemplatePreview template={template} />
                  {/* Click to add photo hint for unselected on hover */}
                  {!isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-sm font-medium text-foreground bg-background/90 px-4 py-2 rounded-full border border-primary/30 shadow-sm flex items-center gap-2">
                        <Camera className="h-4 w-4" />
                        Click to add your photo
                      </span>
                    </div>
                  )}
                </div>
                {isSelected && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-md">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div className="p-3 bg-card pointer-events-none">
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {template.type}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {FORMAT_LABELS_FULL[template.format as keyof typeof FORMAT_LABELS_FULL]}
                    </Badge>
                  </div>
                </div>
              </button>
              {/* Add Photo button below template */}
              <Button
                className="w-full gap-2 min-h-[44px] font-medium"
                onClick={() => handleTemplateClick(template)}
              >
                <Camera className="h-4 w-4" />
                Add Your Photo
              </Button>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
