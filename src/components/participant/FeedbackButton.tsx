import { useState } from "react";
import { MessageSquarePlus, Bug, Send, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { useIsMobile } from "@/hooks/use-mobile";

interface FeedbackButtonProps {
  eventId?: string;
  eventSlug?: string;
}

export default function FeedbackButton({ eventId, eventSlug }: FeedbackButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState<"feedback" | "bug_report">("feedback");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [wantResponse, setWantResponse] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isMobile = useIsMobile();

  const resetForm = () => {
    setMessage("");
    setEmail("");
    setWantResponse(false);
    setFeedbackType("feedback");
  };

  const handleSubmit = async () => {
    if (!message.trim()) {
      toast.error("Please enter your message");
      return;
    }

    if (wantResponse && !email.trim()) {
      toast.error("Please enter your email for a response");
      return;
    }

    setIsSubmitting(true);

    try {
      const { error } = await supabase.from("feedback").insert({
        event_id: eventId || null,
        event_slug: eventSlug || null,
        feedback_type: feedbackType,
        message: message.trim(),
        email: wantResponse ? email.trim() : null,
        page_url: window.location.href,
      });

      if (error) throw error;

      toast.success(
        feedbackType === "feedback"
          ? "Thanks for your feedback!"
          : "Bug report submitted. Thanks for helping us improve!",
      );

      resetForm();
      setIsOpen(false);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      toast.error("Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-4">
      {/* Type Toggle */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant={feedbackType === "feedback" ? "default" : "outline"}
          size="sm"
          onClick={() => setFeedbackType("feedback")}
          className="flex-1 gap-2"
        >
          <MessageSquarePlus className="h-4 w-4" />
          Feedback
        </Button>
        <Button
          type="button"
          variant={feedbackType === "bug_report" ? "default" : "outline"}
          size="sm"
          onClick={() => setFeedbackType("bug_report")}
          className="flex-1 gap-2"
        >
          <Bug className="h-4 w-4" />
          Report Bug
        </Button>
      </div>

      {/* Message */}
      <div className="space-y-2">
        <Textarea
          placeholder={
            feedbackType === "feedback"
              ? "Share your thoughts or suggestions..."
              : "Describe the issue you encountered..."
          }
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="min-h-[100px] resize-none"
          maxLength={1000}
        />
        <p className="text-xs text-muted-foreground text-right">{message.length}/1000</p>
      </div>

      {/* Email Toggle - Enhanced visibility */}
      <div className="flex items-center justify-between gap-3 p-3 rounded-lg border border-primary/30 bg-primary/5">
        <div className="flex items-center gap-2">
          <Mail className="h-4 w-4 text-primary" />
          <Label htmlFor="want-response" className="text-sm font-medium cursor-pointer">
            You want a response?
          </Label>
        </div>
        <Switch
          id="want-response"
          checked={wantResponse}
          onCheckedChange={setWantResponse}
          className="data-[state=unchecked]:bg-muted-foreground/40"
        />
      </div>

      {/* Email Input */}
      {wantResponse && (
        <Input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="transition-all"
        />
      )}

      {/* Submit */}
      <Button onClick={handleSubmit} disabled={isSubmitting || !message.trim()} className="w-full gap-2">
        <Send className="h-4 w-4" />
        {isSubmitting ? "Sending..." : "Send"}
      </Button>
    </div>
  );

  const MobileTriggerButton = (
    <Button
      variant="outline"
      className="h-11 px-4 rounded-full shadow-lg bg-background/90 backdrop-blur-sm border-primary/30 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all gap-2"
      aria-label="Send feedback"
    >
      <MessageSquarePlus className="h-4 w-4" />
      <span className="text-sm font-medium">Feedback</span>
    </Button>
  );

  const DesktopTriggerButton = (
    <Button
      variant="outline"
      className="h-12 px-5 rounded-full shadow-xl bg-background/95 backdrop-blur-md border-primary/40 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all gap-2.5 hover:scale-105 hover:shadow-primary/20 hover:shadow-2xl"
      aria-label="Send feedback"
    >
      <MessageSquarePlus className="h-5 w-5" />
      <span className="font-medium">Feedback or Bugs</span>
    </Button>
  );

  // Mobile: Use Drawer
  if (isMobile) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Drawer open={isOpen} onOpenChange={setIsOpen}>
          <DrawerTrigger asChild>{MobileTriggerButton}</DrawerTrigger>
          <DrawerContent>
            <DrawerHeader>
              <DrawerTitle>Send Feedback</DrawerTitle>
              <DrawerDescription>Help us improve your experience</DrawerDescription>
            </DrawerHeader>
            <div className="px-4 pb-6">{formContent}</div>
          </DrawerContent>
        </Drawer>
      </div>
    );
  }

  // Desktop: Use Popover
  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>{DesktopTriggerButton}</PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-80 p-4" sideOffset={12}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold">Send Feedback</h3>
              <p className="text-xs text-muted-foreground">Help us improve</p>
            </div>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setIsOpen(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
          {formContent}
        </PopoverContent>
      </Popover>
    </div>
  );
}
