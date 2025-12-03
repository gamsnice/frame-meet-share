import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";
import TemplatePreview from "./TemplatePreview";

interface Template {
  id: string;
  name: string;
  type: string;
  format: string;
  image_url: string;
  photo_frame_x: number;
  photo_frame_y: number;
  photo_frame_width: number;
  photo_frame_height: number;
  placeholder_image_url?: string;
  placeholder_scale?: number;
  placeholder_x?: number;
  placeholder_y?: number;
}

interface TemplateSelectorProps {
  templates: Template[];
  selectedTemplate: Template | null;
  onSelect: (template: Template) => void;
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

const FORMAT_ASPECT_RATIOS = {
  square: "aspect-square",
  story: "aspect-[9/16]",
  landscape: "aspect-[1200/630]",
  portrait: "aspect-[4/5]",
};

export default function TemplateSelector({ templates, selectedTemplate, onSelect, isMobile = false }: TemplateSelectorProps) {
  if (isMobile) {
    return (
      <Card className="p-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-base font-medium">Choose Your Frame</h2>
          <span className="text-[10px] text-muted-foreground">{templates.length} available</span>
        </div>
        
        {/* Horizontal Carousel for Mobile */}
        <div className="overflow-x-auto scrollbar-hide -mx-3 px-3">
          <div className="flex gap-2 pb-2" style={{ width: 'max-content' }}>
            {templates.map((template) => {
              const isSelected = selectedTemplate?.id === template.id;
              return (
                <button
                  key={template.id}
                  onClick={() => onSelect(template)}
                  className={`relative rounded-lg border overflow-hidden transition-all flex-shrink-0 ${
                    isSelected 
                      ? "border-primary bg-primary/5 shadow-md" 
                      : "border-border bg-card hover:border-primary/50"
                  }`}
                  style={{ width: '140px' }}
                >
                  <div className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} bg-muted overflow-hidden`}>
                    <TemplatePreview template={template} />
                  </div>
                  {isSelected && (
                    <div className="absolute top-1.5 right-1.5 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                      <Check className="h-3 w-3 text-primary-foreground" />
                    </div>
                  )}
                  <div className="p-1.5 bg-card/80 backdrop-blur-sm">
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
        
        <p className="text-[10px] text-muted-foreground text-center mt-1">
          Swipe to see all frames
        </p>
      </Card>
    );
  }

  // Desktop Layout
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-4">Choose Your Frame</h2>
      <div className="text-left text-sm text-muted-foreground mt-4 mb-6">
        Please note that the resolution displayed here is lower only for preview purposes.
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg ${
                isSelected ? "border-primary ring-2 ring-primary" : "border-border"
              }`}
            >
              <div
                className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} bg-muted overflow-hidden`}
              >
                <TemplatePreview template={template} />
              </div>
              {isSelected && (
                <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className="p-3 bg-card">
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
          );
        })}
      </div>
    </Card>
  );
}
