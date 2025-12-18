import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  email: z.string().trim().email("Please enter a valid email address").max(255, "Email must be less than 255 characters"),
  message: z.string().trim().min(1, "Message is required").max(1000, "Message must be less than 1000 characters"),
});

export default function ContactSection() {
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ name?: string; email?: string; message?: string }>({});

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    const result = contactSchema.safeParse(contactForm);
    if (!result.success) {
      const fieldErrors: { name?: string; email?: string; message?: string } = {};
      result.error.errors.forEach((err) => {
        const field = err.path[0] as keyof typeof fieldErrors;
        fieldErrors[field] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setIsSubmitting(true);
    const validatedData = { name: result.data.name, email: result.data.email, message: result.data.message };
    const { error } = await supabase.from("contact_messages").insert([validatedData]);
    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
    }
    setIsSubmitting(false);
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            Get in <span className="bg-gradient-accent bg-clip-text text-transparent">Touch</span>
          </h2>
          <p className="text-lg text-muted-foreground">Have questions? We'd love to hear from you.</p>
        </div>

        <Card className="p-8 bg-gradient-card border-border/50">
          <form onSubmit={handleContactSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Name
              </label>
              <Input
                id="name"
                value={contactForm.name}
                onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              {errors.name && <p className="text-destructive text-sm mt-1">{errors.name}</p>}
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email
              </label>
              <Input
                id="email"
                type="email"
                value={contactForm.email}
                onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Message
              </label>
              <Textarea
                id="message"
                rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                required
                className="bg-background/50 border-border/50 focus:border-primary"
              />
              {errors.message && <p className="text-destructive text-sm mt-1">{errors.message}</p>}
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-accent text-primary-foreground hover:opacity-90 shadow-glow"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Sending..." : "Send Message"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
