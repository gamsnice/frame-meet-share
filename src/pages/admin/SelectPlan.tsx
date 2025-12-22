import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, Sparkles, Crown, Building2, ArrowRight, Loader2 } from "lucide-react";
import { EnterpriseContactDialog } from "@/components/admin/EnterpriseContactDialog";

type TierKey = "free" | "starter" | "pro" | "premium" | "enterprise";

interface TierConfig {
  id: string;
  tier: TierKey;
  downloads_limit: number;
  events_limit: number;
  templates_limit: number;
  price_yearly_cents: number;
  stripe_price_id: string | null;
  currency: string;
}

const PRO_TIER_LABELS: Record<string, string> = {
  starter: "Classic",
  pro: "Premium",
  premium: "Platin",
};

const formatLimit = (limit: number): string => {
  if (limit === -1) return "Unlimited";
  return limit.toLocaleString();
};

const formatPrice = (cents: number): string => {
  return `€${(cents / 100).toFixed(0)}`;
};

export default function SelectPlan() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProTier, setSelectedProTier] = useState<TierKey>("pro");
  const [enterpriseDialogOpen, setEnterpriseDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      // Get user info
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserEmail(user.email || "");
        const { data: userData } = await supabase.from("users").select("name").eq("id", user.id).single();
        if (userData) setUserName(userData.name);
      }

      // Get tier configs
      const { data, error } = await supabase.from("subscription_tier_config").select("*");

      if (error) {
        console.error("Error fetching configs:", error);
      } else if (data) {
        setConfigs(data as TierConfig[]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

  const tierMap = useMemo(() => {
    const map = new Map<TierKey, TierConfig>();
    configs.forEach((c) => map.set(c.tier, c));
    return map;
  }, [configs]);

  const proTiers = useMemo(() => {
    return configs
      .filter((c) => ["starter", "pro", "premium"].includes(c.tier))
      .sort((a, b) => a.downloads_limit - b.downloads_limit);
  }, [configs]);

  useEffect(() => {
    if (proTiers.length > 0 && !proTiers.find((t) => t.tier === selectedProTier)) {
      setSelectedProTier(proTiers[0].tier);
    }
  }, [proTiers, selectedProTier]);

  const freeConfig = tierMap.get("free");
  const selectedProConfig = tierMap.get(selectedProTier);

  const handleFreePlan = () => {
    toast({
      title: "Welcome to meetme!",
      description: "You're on the Free plan. You can upgrade anytime.",
    });
    navigate("/admin");
  };

  const handleProPlan = async () => {
    if (!selectedProConfig) return;

    setProcessingTier(selectedProTier);

    if (selectedProConfig.stripe_price_id) {
      // Redirect to Stripe checkout (will be implemented with Stripe integration)
      toast({
        title: "Redirecting to checkout...",
        description: "Please complete your payment to activate your plan.",
      });
      // For now, show coming soon until Stripe is fully integrated
      setTimeout(() => {
        toast({
          title: "Payment Integration Coming Soon",
          description: "Contact us to get started with Pro today!",
        });
        setProcessingTier(null);
      }, 1000);
    } else {
      toast({
        title: "Coming Soon",
        description: "Payment integration is being set up. Contact us to get started!",
      });
      setProcessingTier(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
            <Sparkles className="h-4 w-4" />
            <span className="text-sm font-medium">Account Created Successfully!</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Choose Your Plan</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Start for free or unlock the full potential of meetme with a Pro plan. Upgrade anytime as your events grow.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Free Plan - Muted */}
          <Card className="p-6 border-border/50 bg-card/50 relative">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">€0</span>
                <span className="text-muted-foreground text-sm">/year</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-muted-foreground/60" />
                <span>{formatLimit(freeConfig?.downloads_limit || 10)} visual downloads</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-muted-foreground/60" />
                <span>{formatLimit(freeConfig?.events_limit || 1)} active event</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-muted-foreground/60" />
                <span>{formatLimit(freeConfig?.templates_limit || 2)} templates</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-muted-foreground/60" />
                <span>Basic analytics</span>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Check className="h-4 w-4 text-muted-foreground/60" />
                <span>Community support</span>
              </li>
            </ul>

            <Button variant="outline" className="w-full" onClick={handleFreePlan}>
              Continue with Free
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">You can upgrade anytime</p>
          </Card>

          {/* Pro Plan - Emphasized */}
          <Card className="p-6 border-primary/50 bg-gradient-to-b from-primary/5 to-background relative scale-105 shadow-xl shadow-primary/10 z-10">
            {/* Most Popular Badge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-lg">
                <Crown className="h-3 w-3" />
                Most Popular
              </div>
            </div>

            <div className="mb-6 pt-2">
              <h3 className="text-lg font-semibold text-foreground mb-1">Pro</h3>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-4xl font-bold text-foreground">
                  {selectedProConfig ? formatPrice(selectedProConfig.price_yearly_cents) : "€99"}
                </span>
                <span className="text-muted-foreground text-sm">/year</span>
              </div>

              {/* Tier Selector */}
              <div className="flex gap-2 p-1 bg-muted/50 rounded-lg">
                {proTiers.map((tier) => (
                  <button
                    key={tier.tier}
                    onClick={() => setSelectedProTier(tier.tier)}
                    className={`flex-1 px-3 py-2 rounded-md text-xs font-medium transition-all ${
                      selectedProTier === tier.tier
                        ? "bg-primary text-primary-foreground shadow-sm"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    }`}
                  >
                    {PRO_TIER_LABELS[tier.tier] || tier.tier}
                  </button>
                ))}
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span className="font-medium">
                  {formatLimit(selectedProConfig?.downloads_limit || 100)} visual downloads
                </span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>{formatLimit(selectedProConfig?.events_limit || 5)} active events</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>{formatLimit(selectedProConfig?.templates_limit || 10)} templates</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Advanced analytics</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Priority support</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Custom branding</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>No meetme watermark</span>
              </li>
            </ul>

            <Button
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg"
              size="lg"
              onClick={handleProPlan}
              disabled={processingTier !== null}
            >
              {processingTier === selectedProTier ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Get Pro Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">Trusted by event organizers of all sizes</p>
          </Card>

          {/* Enterprise Plan */}
          <Card className="p-6 border-border bg-card relative">
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-1">
                <Building2 className="h-5 w-5 text-foreground" />
                <h3 className="text-lg font-semibold text-foreground">Enterprise</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">Custom</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited downloads</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited events</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Unlimited templates</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>White-label solution</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Dedicated account manager</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>Custom integrations</span>
              </li>
              <li className="flex items-center gap-2 text-foreground">
                <Check className="h-4 w-4 text-primary" />
                <span>SLA guarantee</span>
              </li>
            </ul>

            <Button variant="secondary" className="w-full" onClick={() => setEnterpriseDialogOpen(true)}>
              Contact Us
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">Tailored to your needs</p>
          </Card>
        </div>
      </div>

      <EnterpriseContactDialog
        open={enterpriseDialogOpen}
        onOpenChange={setEnterpriseDialogOpen}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  );
}
