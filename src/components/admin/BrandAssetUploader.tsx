import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";

interface BrandAssetUploaderProps {
  eventId: string;
  assetType: "logo" | "secondary-logo" | "favicon";
  currentUrl?: string;
  onUploadComplete: (url: string) => void;
  recommendedSize?: string;
  acceptedFormats?: string;
}

export default function BrandAssetUploader({
  eventId,
  assetType,
  currentUrl,
  onUploadComplete,
  recommendedSize = "200x60px",
  acceptedFormats = ".png,.jpg,.jpeg,.svg",
}: BrandAssetUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const getLabel = () => {
    switch (assetType) {
      case "logo":
        return "Main Logo";
      case "secondary-logo":
        return "Secondary Logo";
      case "favicon":
        return "Favicon";
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validTypes = ["image/png", "image/jpeg", "image/jpg", "image/svg+xml"];
    if (assetType === "favicon") {
      validTypes.push("image/x-icon");
    }

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type. Please upload an image file.");
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("File too large. Maximum size is 2MB.");
      return;
    }

    setUploading(true);

    try {
      const fileExt = file.name.split(".").pop();
      const fileName = `${assetType}.${fileExt}`;
      const filePath = `${eventId}/${fileName}`;

      // Upload to Supabase storage
      const { error: uploadError } = await supabase.storage
        .from("event-assets")
        .upload(filePath, file, {
          upsert: true,
          contentType: file.type,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data } = supabase.storage
        .from("event-assets")
        .getPublicUrl(filePath);

      onUploadComplete(data.publicUrl);
      toast.success(`${getLabel()} uploaded successfully!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(`Failed to upload ${getLabel().toLowerCase()}`);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = () => {
    setDragActive(false);
  };

  const handleRemove = async () => {
    if (!currentUrl) return;

    try {
      // Extract file path from URL
      const urlParts = currentUrl.split("/");
      const filePath = `${eventId}/${urlParts[urlParts.length - 1]}`;

      await supabase.storage.from("event-assets").remove([filePath]);
      onUploadComplete("");
      toast.success(`${getLabel()} removed`);
    } catch (error: any) {
      console.error("Remove error:", error);
      toast.error("Failed to remove asset");
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">{getLabel()}</p>
          <p className="text-xs text-muted-foreground">Recommended: {recommendedSize}</p>
        </div>
      </div>

      {currentUrl ? (
        <div className="relative group rounded-xl border-2 border-border bg-card p-4 transition-all hover:border-primary/50">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
              <img
                src={currentUrl}
                alt={getLabel()}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Current {getLabel()}</p>
              <p className="text-xs text-muted-foreground">Click replace to change</p>
            </div>
          </div>
          <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
            <Button
              type="button"
              size="sm"
              variant="destructive"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3">
            <label htmlFor={`${assetType}-replace`}>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                onClick={() => document.getElementById(`${assetType}-replace`)?.click()}
              >
                <Upload className="h-3 w-3 mr-2" />
                Replace
              </Button>
              <input
                id={`${assetType}-replace`}
                type="file"
                accept={acceptedFormats}
                onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
            </label>
          </div>
        </div>
      ) : (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`
            relative rounded-xl border-2 border-dashed p-8 transition-all
            ${dragActive ? "border-primary bg-primary/5 scale-[1.02]" : "border-border hover:border-primary/50"}
            ${uploading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          `}
        >
          <input
            id={`${assetType}-upload`}
            type="file"
            accept={acceptedFormats}
            onChange={(e) => e.target.files && handleFileUpload(e.target.files[0])}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
          <div className="flex flex-col items-center justify-center text-center space-y-3">
            <div className="rounded-full bg-primary/10 p-3">
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-r-transparent" />
              ) : (
                <ImageIcon className="h-6 w-6 text-primary" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium">
                {uploading ? "Uploading..." : dragActive ? "Drop file here" : "Click or drag to upload"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                PNG, JPG, SVG up to 2MB
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
