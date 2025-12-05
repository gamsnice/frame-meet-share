import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

export default function PricingSection() {
  const navigate = useNavigate();

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-accent bg-clip-text text-transparent"> Invest in Results</span> not Agencies
          </h2>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Free Tier */}
          <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Just Getting Started</h3>
              <p className="text-sm text-muted-foreground">Perfect for trying out meetme</p>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Free</span>
              <p className="text-xs text-muted-foreground mt-1">Forever • No credit card required</p>
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

          {/* Pro Tier */}
          <Card className="p-8 bg-gradient-card border-primary/50 border-2 relative shadow-glow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-accent text-primary-foreground px-6 py-1.5 rounded-full text-sm font-semibold shadow-glow">
              Most Popular
            </div>
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Growing Events</h3>
              <p className="text-sm text-muted-foreground">Save 100+ hours vs. traditional marketing</p>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Pro</span>
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

          {/* Enterprise Tier */}
          <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Enterprise Scale</h3>
            </div>
            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Custom</span>
              <p className="text-xs text-muted-foreground mt-1">Tailored to your needs</p>
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
            <Button className="w-full" variant="outline" onClick={scrollToContact}>
              Contact Us
            </Button>
          </Card>
        </div>
      </div>
    </section>
  );
}
