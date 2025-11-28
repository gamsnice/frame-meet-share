import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

interface ResetStatsDialogProps {
  eventId?: string;
  startDate?: Date;
  endDate?: Date;
  onSuccess?: () => void;
}

export default function ResetStatsDialog({ eventId, startDate, endDate, onSuccess }: ResetStatsDialogProps) {
  const [isResetting, setIsResetting] = useState(false);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      const { error } = await supabase.rpc("reset_event_stats", {
        p_event_id: eventId || null,
        p_start_date: startDate ? startDate.toISOString().split("T")[0] : null,
        p_end_date: endDate ? endDate.toISOString().split("T")[0] : null,
      });

      if (error) throw error;

      toast.success("Statistics reset successfully");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to reset stats:", error);
      toast.error("Failed to reset statistics");
    } finally {
      setIsResetting(false);
    }
  };

  const getDescription = () => {
    if (eventId && startDate && endDate) {
      return `This will permanently delete all statistics for this event between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}.`;
    } else if (eventId) {
      return "This will permanently delete all statistics for this event.";
    } else if (startDate && endDate) {
      return `This will permanently delete all statistics for all your events between ${startDate.toLocaleDateString()} and ${endDate.toLocaleDateString()}.`;
    } else {
      return "This will permanently delete all statistics for all your events.";
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="destructive" size="sm">
          <Trash2 className="mr-2 h-4 w-4" />
          Reset Stats
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            {getDescription()} This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleReset} disabled={isResetting} className="bg-destructive text-destructive-foreground">
            {isResetting ? "Resetting..." : "Reset"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
