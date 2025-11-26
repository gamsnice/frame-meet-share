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
      <div className="space-y-8">
        {templates.map((template) => {
          const isSelected = selectedTemplate?.id === template.id;
          const aspectRatio = FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS];
          
          return (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              className={`w-full text-left transition-all group ${
                isSelected ? "opacity-100" : "opacity-70 hover:opacity-100"
              }`}
            >
              <div className={`relative rounded-lg border-2 overflow-hidden transition-all ${
                isSelected 
                  ? "border-primary ring-2 ring-primary shadow-lg" 
                  : "border-border hover:border-primary/50 hover:shadow-md"
              }`}>
                <div className={`${aspectRatio} bg-muted w-full max-w-md mx-auto relative`}>
                  <img
                    src={template.image_url}
                    alt={template.name}
                    className="w-full h-full object-contain"
                  />
                  {isSelected && (
                    <div className="absolute top-3 right-3 h-7 w-7 rounded-full bg-primary flex items-center justify-center shadow-lg">
                      <Check className="h-4 w-4 text-primary-foreground" />
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-3 px-2">
                <p className="font-medium text-sm mb-2">{template.name}</p>
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
