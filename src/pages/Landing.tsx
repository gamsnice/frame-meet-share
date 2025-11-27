import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import {
  Sparkles,
  Users,
  LayoutTemplate,
  BarChart3,
  Check,
  ArrowRight,
  Instagram,
  Linkedin,
  ChevronDown,
} from "lucide-react";
import meetmeLogo from "@/assets/meetme-logo.png";
import exampleSkinnovation from "@/assets/example-skinnovation.jpg";
import exampleBitsAndPretzels from "@/assets/example-bitsandpretzels.jpg";
import exampleSlush from "@/assets/example-slush.jpg";

export default function Landing() {
  const navigate = useNavigate();
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activeExample, setActiveExample] = useState(0);

  const examples = [{ image: exampleSkinnovation }, { image: exampleBitsAndPretzels }, { image: exampleSlush }];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveExample((prev) => (prev + 1) % examples.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const { error } = await supabase.from("contact_messages").insert([contactForm]);

    if (error) {
      toast.error("Failed to send message");
    } else {
      toast.success("Message sent! We'll get back to you soon.");
      setContactForm({ name: "", email: "", message: "" });
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sticky Navigation */}
      <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <img src={meetmeLogo} alt="meetme" className="h-8 w-auto" />
              <span className="text-xl font-bold bg-gradient-accent bg-clip-text text-transparent">meetme</span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" onClick={() => navigate("/admin/login")} className="hover:bg-muted">
                Login
              </Button>
              <Button
                onClick={() => navigate("/admin/register")}
                className="bg-gradient-accent text-primary-foreground hover:opacity-90"
              >
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-hero py-20 md:py-32">
        <div className="absolute inset-0 bg-gradient-glow opacity-50"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            {/* Left: Copy */}
            <div className="text-foreground">
              <h1 className="mb-6 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl animate-fade-in">
                <span className="bg-gradient-accent bg-clip-text text-transparent">'Meet me at...'</span> visuals for
                your event - in seconds
              </h1>
              <p
                className="mb-4 text-lg text-muted-foreground md:text-xl animate-fade-in"
                style={{ animationDelay: "0.1s" }}
              >
                <span className="inline-flex items-center gap-2">
                  <img src={meetmeLogo} alt="meetme" className="h-5 w-auto inline" />
                  <span className="font-semibold bg-gradient-accent bg-clip-text text-transparent">meetme</span>
                </span>{" "}
                gives your event a shareable visuals page. You design the frames, your attendees drop in their selfie,
                and their feeds do the marketing.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row animate-fade-in" style={{ animationDelay: "0.2s" }}>
                <Button
                  size="lg"
                  className="bg-gradient-accent text-primary-foreground hover:opacity-90 font-semibold shadow-glow"
                  onClick={() => navigate("/admin/register")}
                >
                  Create my event visuals
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-border hover:bg-muted"
                  onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See how it works
                  <ChevronDown className="ml-2 h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Right: Animated Example Images */}
            <div className="relative h-[500px] animate-scale-in" style={{ animationDelay: "0.3s" }}>
              <div className="absolute inset-0 flex items-center justify-center">
                {examples.map((example, index) => {
                  const isActive = index === activeExample;
                  const offset = (index - activeExample + examples.length) % examples.length;

                  return (
                    <div
                      key={index}
                      className="absolute transition-all duration-700 ease-out cursor-pointer hover:scale-105"
                      style={{
                        transform: `translateX(${offset * 120 - 120}px) translateY(${Math.abs(offset - 1) * 30}px) scale(${isActive ? 1 : 0.85})`,
                        zIndex: isActive ? 20 : 10 - Math.abs(offset - 1),
                        opacity: Math.abs(offset - 1) > 1 ? 0 : 1,
                      }}
                      onClick={() => setActiveExample(index)}
                    >
                      <div
                        className={`relative rounded-2xl overflow-hidden shadow-hover ${isActive ? "animate-glow-pulse" : ""}`}
                      >
                        <img
                          src={example.image}
                          alt={example.label}
                          className="h-[400px] w-auto object-cover rounded-2xl"
                        />
                        {isActive && (
                          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 to-transparent p-4">
                            <p className="text-foreground font-semibold text-center">{example.label}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Floating decoration circles */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl animate-float"></div>
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-float-delayed"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center animate-slide-up">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Everything you need to frame your event</h2>
            <p className="text-lg text-muted-foreground">From backend to brand to buzz</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <LayoutTemplate className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">A backend for your event visuals</h3>
              <p className="text-muted-foreground">
                Create events, upload frames, define where the guest's photo goes, and control everything from one
                place.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 hover:border-secondary/50 hover:shadow-glow-orange transition-all duration-300 group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <Sparkles className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Personalized 'Meet me at...' posts</h3>
              <p className="text-muted-foreground">
                Attendees open your link, pick a frame, drop their photo, and download a share-ready visual.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 hover:border-primary/50 hover:shadow-glow transition-all duration-300 group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Built for social formats</h3>
              <p className="text-muted-foreground">
                Square, story, landscape, portrait – optimized sizes for Instagram, LinkedIn, and more.
              </p>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50 hover:border-secondary/50 hover:shadow-glow-orange transition-all duration-300 group">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                <BarChart3 className="h-6 w-6 text-secondary" />
              </div>
              <h3 className="mb-2 text-xl font-semibold">Analytics that speak 'hype'</h3>
              <p className="text-muted-foreground">
                See how many people open, upload, and download – and which frames perform best.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">
              How{" "}
              <span className="inline-flex items-center gap-2">
                <img src={meetmeLogo} alt="meetme" className="h-8 w-auto inline" />
                <span className="bg-gradient-accent bg-clip-text text-transparent">meetme</span>
              </span>{" "}
              works
            </h2>
            <p className="text-lg text-muted-foreground">Three steps to social proof</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-2xl shadow-glow">
                1
              </div>
              <h3 className="mb-2 text-xl font-semibold">Create your event</h3>
              <p className="text-muted-foreground">
                Sign up, add your event details, upload your templates, define the face area, and set captions.
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-2xl shadow-glow">
                2
              </div>
              <h3 className="mb-2 text-xl font-semibold">Share your event link</h3>
              <p className="text-muted-foreground">
                Each event gets a unique URL like{" "}
                <code className="text-sm bg-muted/50 px-2 py-1 rounded text-primary">/e/skinnovation-2026</code>
              </p>
            </div>

            <div className="relative">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-accent text-primary-foreground font-bold text-2xl shadow-glow">
                3
              </div>
              <h3 className="mb-2 text-xl font-semibold">Your attendees make the magic</h3>
              <p className="text-muted-foreground">
                They choose a frame, fit their photo into your design, download, and share 'Meet me at [Event]' posts.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="text-lg text-muted-foreground">Choose the plan that fits your event</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
              <h3 className="mb-2 text-2xl font-bold">Starter Event</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Free</span>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>1 event</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Up to 3 templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Basic analytics</span>
                </li>
              </ul>
              <Button className="w-full" variant="outline" onClick={() => navigate("/admin/register")}>
                Get Started
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-card border-primary/50 border-2 relative shadow-glow">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-accent text-primary-foreground px-6 py-1.5 rounded-full text-sm font-semibold shadow-glow">
                Popular
              </div>
              <h3 className="mb-2 text-2xl font-bold">Growing Events</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Pro</span>
                <span className="text-muted-foreground ml-2 text-sm">coming soon</span>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Unlimited events</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Unlimited templates</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Advanced analytics</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <span>Custom branding</span>
                </li>
              </ul>
              <Button
                className="w-full bg-gradient-accent text-primary-foreground hover:opacity-90"
                onClick={() => navigate("/admin/register")}
              >
                Get Started
              </Button>
            </Card>

            <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300">
              <h3 className="mb-2 text-2xl font-bold">Big Show</h3>
              <div className="mb-4">
                <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Enterprise</span>
              </div>
              <ul className="mb-6 space-y-3">
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Everything in Pro</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Priority support</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Custom integrations</span>
                </li>
                <li className="flex items-start gap-2">
                  <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                  <span>Dedicated account manager</span>
                </li>
              </ul>
              <Button
                className="w-full"
                variant="outline"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Contact Us
              </Button>
            </Card>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-gradient-card">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Frequently asked questions</h2>
          </div>

          <div className="space-y-4">
            <Card className="p-6 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <h3 className="mb-2 font-semibold text-lg">Do my attendees need an account?</h3>
              <p className="text-muted-foreground">No. They just open the link, upload, download.</p>
            </Card>

            <Card className="p-6 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <h3 className="mb-2 font-semibold text-lg">Is there really an admin backend?</h3>
              <p className="text-muted-foreground">
                Yes. You control events, templates, and branding from a complete dashboard.
              </p>
            </Card>

            <Card className="p-6 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <h3 className="mb-2 font-semibold text-lg">Do you store attendee photos?</h3>
              <p className="text-muted-foreground">
                No, photos stay in the browser and the downloaded image. We never store participant photos.
              </p>
            </Card>

            <Card className="p-6 bg-background/50 backdrop-blur-sm border-border/50 hover:border-primary/30 transition-colors">
              <h3 className="mb-2 font-semibold text-lg">What image formats do you support?</h3>
              <p className="text-muted-foreground">
                Square (1080x1080), Story (1080x1920), Landscape (1200x630), and Portrait (1080x1350) – optimized for
                all major social platforms.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-background">
        <div className="container mx-auto px-4 max-w-2xl">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Get in touch</h2>
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

      {/* Footer */}
      <footer className="border-t border-border/50 bg-gradient-card py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-2">
                <img src={meetmeLogo} alt="meetme" className="h-8 w-auto" />
                <span className="text-2xl font-bold bg-gradient-accent bg-clip-text text-transparent">meetme</span>
              </div>
              <p className="text-sm text-muted-foreground">© 2024 meetme. All rights reserved.</p>
            </div>
            <div className="flex gap-6">
              <Instagram className="h-6 w-6 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Linkedin className="h-6 w-6 text-muted-foreground hover:text-secondary cursor-pointer transition-colors" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
