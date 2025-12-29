import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, Image } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import type { PlaceholderImage } from "@/types";

interface PlaceholderLibraryProps {
  userId: string;
}

export default function PlaceholderLibrary({ userId }: PlaceholderLibraryProps) {
  const [images, setImages] = useState<PlaceholderImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    loadImages();
  }, [userId]);

  const loadImages = async () => {
    try {
      const { data, error } = await supabase
        .from("placeholder_images")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error: any) {
      console.error("Failed to load placeholder images:", error);
      toast.error("Failed to load placeholder images");
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePermanently = async (image: PlaceholderImage) => {
    setDeleting(image.id);
    try {
      // 1. Delete from storage
      const path = image.image_url.split("/event-assets/")[1];
      if (path) {
        if (path.includes("..")) throw new Error("Invalid path");
        await supabase.storage.from("event-assets").remove([path]);
      }

      // 2. Delete from database (ON DELETE SET NULL will handle templates)
      const { error } = await supabase.from("placeholder_images").delete().eq("id", image.id);

      if (error) throw error;

      setImages((prev) => prev.filter((img) => img.id !== image.id));
      toast.success("Image permanently deleted");
    } catch (error: any) {
      console.error("Failed to delete image:", error);
      toast.error("Failed to delete image");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded w-1/3" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="aspect-square bg-muted rounded-lg" />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-4">
        <h3 className="font-semibold flex items-center gap-2">
          <Image className="h-5 w-5" />
          Placeholder Library
        </h3>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your placeholder images. Deleting an image will remove it from all templates using it.
        </p>
      </div>

      {images.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          <Image className="h-12 w-12 mx-auto mb-3 opacity-50" />
          <p>No placeholder images uploaded yet.</p>
          <p className="text-sm">Upload images when managing template placeholders.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={img.image_url} alt={img.original_filename} className="w-full h-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-lg">
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" size="sm" disabled={deleting === img.id}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete permanently?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will permanently delete this image and remove it from all templates using it. This action
                        cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeletePermanently(img)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Delete Permanently
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
              <p className="text-xs truncate mt-1.5 text-muted-foreground">{img.original_filename}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
