import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import TemplatePreview from "@/components/participant/TemplatePreview";
import { FORMAT_DIMENSIONS_WITH_LABELS, FORMAT_ASPECT_RATIOS, type Template } from "@/types";

interface TemplateCardProps {
  template: Template;
  onEdit: (template: Template) => void;
  onDelete: (id: string) => void;
  onOpenCaptions: (template: Template) => void;
  onOpenPlaceholder: (template: Template) => void;
}

export function TemplateCard({ template, onEdit, onDelete, onOpenCaptions, onOpenPlaceholder }: TemplateCardProps) {
  return (
    <Card className="p-4 group hover:shadow-hover transition-shadow">
      <div
        className={`${FORMAT_ASPECT_RATIOS[template.format as keyof typeof FORMAT_ASPECT_RATIOS]} rounded-lg bg-muted mb-4 relative overflow-hidden`}
      >
        <TemplatePreview template={template} className="w-full h-full object-contain" />
      </div>

      <h3 className="font-semibold mb-1">{template.name}</h3>
      <div className="flex gap-2 text-xs mb-3">
        <span className="px-2 py-1 bg-primary/10 text-primary rounded">{template.type}</span>
        <span className="px-2 py-1 bg-secondary/10 text-secondary rounded">
          {FORMAT_DIMENSIONS_WITH_LABELS[template.format as keyof typeof FORMAT_DIMENSIONS_WITH_LABELS]?.label}
        </span>
      </div>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-3 gap-2">
          <Button size="sm" variant="outline" className="min-h-[40px]" onClick={() => onEdit(template)}>
            <Pencil className="h-3 w-3 sm:mr-1" />
            <span className="hidden sm:inline">Edit</span>
          </Button>
          <Button size="sm" variant="outline" className="min-h-[40px]" onClick={() => onOpenCaptions(template)}>
            <span className="text-xs sm:text-sm">Captions</span>
          </Button>
          <Button size="sm" variant="outline" className="min-h-[40px]" onClick={() => onDelete(template.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
        <Button size="sm" variant="outline" className="w-full min-h-[40px]" onClick={() => onOpenPlaceholder(template)}>
          <User className="mr-1 h-3 w-3" />
          Placeholder
        </Button>
      </div>
    </Card>
  );
}
