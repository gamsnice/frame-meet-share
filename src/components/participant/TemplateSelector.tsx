import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check } from "lucide-react";

interface Template {
  id: string;
  name: string;
  type: string;
  format: string;
  image_url: string;
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

export default function TemplateSelector({
  templates,
  selectedTemplate,
  onSelect,
}: TemplateSelectorProps) {
  return (
    <Card className="p-6">
      <h2 className="text-xl font-semibold mb-6">Choose Your Frame</h2>
      <div className="flex flex-wrap gap-6 justify-center">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          const aspectRatio = FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS];
          
          // Calculate display width based on format
          const getWidthClass = () => {
            switch (template.format) {
              case 'story':
                return 'w-32 sm:w-40'; // Narrower for vertical formats
              case 'landscape':
                return 'w-48 sm:w-64'; // Wider for horizontal formats
              case 'portrait':
                return 'w-36 sm:w-44'; // Medium for portrait
              default:
                return 'w-40 sm:w-48'; // Square
            }
          };
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`relative rounded-lg border-2 overflow-hidden transition-all hover:shadow-lg hover:scale-105 ${getWidthClass()} ${
                isSelected ? "border-primary ring-2 ring-primary" : "border-border hover:border-primary/50"
              }`}
            >
              <div className={`${aspectRatio} bg-muted relative`}>
                <img
                  src={template.image_url}
                  alt={template.name}
                  className="w-full h-full object-contain"
                />
                {isSelected && (
                  <div className="absolute top-2 right-2 h-6 w-6 rounded-full bg-primary flex items-center justify-center shadow-lg">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </div>
              <div className="p-3 bg-card border-t">
                <p className="font-medium text-xs mb-2 truncate">{template.name}</p>
                <div className="flex flex-col gap-1.5">
                  <Badge variant="secondary" className="text-[10px] py-0.5 justify-center">
                    {template.type}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] py-0.5 justify-center">
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
