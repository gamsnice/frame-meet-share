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
}

const FORMAT_LABELS = {
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

export default function TemplateSelector({ templates, selectedTemplate, onSelect }: TemplateSelectorProps) {
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
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
              <div className="p-3 bg-card">
                <div className="flex gap-2">
                  <Badge variant="secondary" className="text-xs">
                    {template.type}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {FORMAT_LABELS[template.format as keyof typeof FORMAT_LABELS]}
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
