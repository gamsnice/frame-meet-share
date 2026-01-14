import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Loader2, Building2 } from "lucide-react";

interface CustomPackageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userEmail?: string;
  userName?: string;
}

const EVENT_TYPES = [
  "Conference",
  "Corporate Event",
  "Trade Show",
  "Product Launch",
  "Networking Event",
  "Summit",
  "Workshop / Seminar",
  "Other",
];

const DOWNLOAD_RANGES = ["< 500", "500 - 1,000", "1,000 - 5,000", "5,000 - 10,000", "10,000+", "Unlimited"];

const EVENTS_PER_YEAR = ["1 - 2", "3 - 5", "5 - 10", "10+"];

export function CustomPackageDialog({ open, onOpenChange, userEmail = "", userName = "" }: CustomPackageDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: userName,
    email: userEmail,
    company: "",
    phone: "",
    eventType: "",
    downloads: "",
    eventsPerYear: "",
    message: "",
  });

  // Update form when user props change
  useState(() => {
    setFormData((prev) => ({
      ...prev,
      name: userName || prev.name,
      email: userEmail || prev.email,
    }));
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.email.trim()) {
      toast({
        title: "Required fields missing",
        description: "Please fill in your name and email.",
        variant: "destructive",
      });
      return;
    }

    if (!formData.eventType || !formData.downloads) {
      toast({
        title: "Required fields missing",
        description: "Please fill in event type and expected downloads.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Format the message with all details
    const formattedMessage = `[Custom Package Request]
Company: ${formData.company || "Not provided"}
Phone: ${formData.phone || "Not provided"}

Event Type: ${formData.eventType}
Expected Downloads/Year: ${formData.downloads}
Events per Year: ${formData.eventsPerYear || "Not specified"}

Additional Message:
${formData.message || "No additional message provided."}`;

    const { error } = await supabase.from("contact_messages").insert({
      name: formData.name.trim(),
      email: formData.email.trim(),
      message: formattedMessage,
    });

    setIsSubmitting(false);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to submit your request. Please try again.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Request Submitted!",
      description: "We'll get back to you within 24 hours with a custom quote.",
    });

    // Reset form and close
    setFormData({
      name: userName,
      email: userEmail,
      company: "",
      phone: "",
      eventType: "",
      downloads: "",
      eventsPerYear: "",
      message: "",
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="h-5 w-5 text-primary" />
            <DialogTitle>Request Custom Package</DialogTitle>
          </div>
          <DialogDescription>
            Tell us about your event needs and we'll create a tailored package for you.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          {/* Contact Information */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">Contact Information</h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="name">
                  Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  placeholder="Your name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  placeholder="you@company.com"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData((prev) => ({ ...prev, company: e.target.value }))}
                  placeholder="Company name"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                  placeholder="+49 123 456789"
                  required
                />
              </div>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-3 pt-2">
            <h4 className="text-sm font-medium text-muted-foreground">Event Details</h4>

            <div className="space-y-1.5">
              <Label htmlFor="eventType">
                Event Type <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.eventType}
                onValueChange={(v) => setFormData((prev) => ({ ...prev, eventType: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="downloads">
                  Downloads/Year <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.downloads}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, downloads: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select range" />
                  </SelectTrigger>
                  <SelectContent>
                    {DOWNLOAD_RANGES.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="eventsPerYear">Events per Year</Label>
                <Select
                  value={formData.eventsPerYear}
                  onValueChange={(v) => setFormData((prev) => ({ ...prev, eventsPerYear: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {EVENTS_PER_YEAR.map((range) => (
                      <SelectItem key={range} value={range}>
                        {range}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Additional Message */}
          <div className="space-y-1.5 pt-2">
            <Label htmlFor="message">Additional Requirements</Label>
            <Textarea
              id="message"
              value={formData.message}
              onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
              placeholder="Tell us more about your specific needs, integrations, or any questions you have..."
              rows={3}
            />
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>

          <p className="text-xs text-muted-foreground text-center">
            We typically respond within 24 hours with a custom quote.
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
