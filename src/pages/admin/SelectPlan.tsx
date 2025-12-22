import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Check, Sparkles, Crown, Building2, ArrowRight, Loader2 } from "lucide-react";
import { CustomPackageDialog } from "@/components/admin/CustomPackageDialog";

type TierKey = "free" | "starter" | "pro" | "premium" | "enterprise";

interface TierConfig {
  id: string;
  tier: TierKey;
  downloads_limit: number; // -1 = unlimited
  events_limit: number; // -1 = unlimited
  templates_limit: number; // -1 = unlimited
  price_yearly_cents: number;
  stripe_price_id: string | null;
  currency: string; // e.g. "EUR"
}

const TIER_ORDER: TierKey[] = ["free", "starter", "pro", "premium", "enterprise"];

const PRO_TIER_LABELS: Record<string, string> = {
  starter: "Classic",
  pro: "Premium",
  premium: "Platin",
};

// Benefits (same as PricingSection)
const BASE_FEATURES_ALL_PLANS = ["Analytics dashboard", "Custom branding"];
const SUPPORT_FREE = "Basic support";
const SUPPORT_PRO = "Priority support";
const ONBOARDING_OPTIONAL = "Dedicated onboarding (optional)";

const VISUAL_DOWNLOADS_FOOTNOTE =
  "Visual Downloads are the maximum number of downloads that can be done within 1 year.";

const isUnlimited = (n: number) => n === -1;

const formatPrice = (cents: number): string => {
  return `€${Math.round((cents || 0) / 100)}`;
};

const formatLimit = (singular: string, plural: string, n: number) => {
  if (isUnlimited(n)) return `Unlimited ${plural}`;
  return `${n} ${n === 1 ? singular : plural}`;
};

export default function SelectPlan() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProTier, setSelectedProTier] = useState<TierKey>("pro");
  const [customPackageDialogOpen, setCustomPackageDialogOpen] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [processingTier, setProcessingTier] = useState<string | null>(null);

  useEffect(() => {
    let channel: any;

    const fetchConfigs = async () => {
      const { data, error } = await supabase.from("subscription_tier_config").select("*").in("tier", TIER_ORDER);

      if (error) {
        console.error("Error fetching configs:", error);
        return;
      }
      setConfigs((data || []) as TierConfig[]);
    };

    const fetchUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return;

      setUserEmail(user.email || "");
      const { data: userData } = await supabase.from("users").select("name").eq("id", user.id).single();
      if (userData?.name) setUserName(userData.name);
    };

    const init = async () => {
      setLoading(true);
      await Promise.all([fetchUser(), fetchConfigs()]);
      setLoading(false);
    };

    init();

    // ✅ Realtime updates when Super Admin changes tier config
    channel = supabase
      .channel("subscription_tier_config_changes_select_plan")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_tier_config" }, () => {
        fetchConfigs();
      })
      .subscribe();

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, []);

  const tierMap = useMemo(() => {
    const map = new Map<TierKey, TierConfig>();
    configs.forEach((c) => map.set(c.tier, c));
    return map;
  }, [configs]);

  // ✅ Pro tiers come from backend and are ordered by downloads_limit (like your old behavior)
  const proTiers = useMemo(() => {
    const arr = configs.filter((c) => ["starter", "pro", "premium"].includes(c.tier));
    return arr.sort((a, b) => {
      const aVal = a.downloads_limit === -1 ? Number.POSITIVE_INFINITY : (a.downloads_limit ?? 0);
      const bVal = b.downloads_limit === -1 ? Number.POSITIVE_INFINITY : (b.downloads_limit ?? 0);
      return aVal - bVal;
    });
  }, [configs]);

  // Largest Pro tier downloads (used for enterprise wording)
  const maxProDownloads = useMemo(() => {
    const nums = proTiers.map((t) => t.downloads_limit).filter((n) => typeof n === "number" && n !== -1) as number[];
    return nums.length ? Math.max(...nums) : 1000;
  }, [proTiers]);

  useEffect(() => {
    // If current selection no longer exists, fall back
    if (proTiers.length > 0 && !proTiers.find((t) => t.tier === selectedProTier)) {
      setSelectedProTier(proTiers[0].tier);
    }
  }, [proTiers, selectedProTier]);

  const freeConfig = tierMap.get("free");
  const selectedProConfig = tierMap.get(selectedProTier);
  const enterpriseConfig = tierMap.get("enterprise");

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
      toast({
        title: "Redirecting to checkout...",
        description: "Please complete your payment to activate your plan.",
      });

      // Placeholder until Stripe is integrated
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
            All plans are a one-time payment and limits apply per year.
          </p>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-3 gap-6 items-start">
          {/* Free Plan */}
          <Card className="p-6 border-border/50 bg-card/50 relative">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-muted-foreground mb-1">Free</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-3xl font-bold text-foreground">
                  {freeConfig ? formatPrice(freeConfig.price_yearly_cents) : "Free"}
                </span>
                <span className="text-muted-foreground text-sm">/ no credit card required</span>
              </div>
            </div>

            <ul className="space-y-3 mb-8 text-sm">
              {freeConfig ? (
                [
                  formatLimit("Visual Download", "Visual Downloads", freeConfig.downloads_limit),
                  formatLimit("Event", "Events", freeConfig.events_limit),
                  formatLimit("Template", "Templates", freeConfig.templates_limit),
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_FREE,
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-muted-foreground">
                    <Check className="h-4 w-4 text-muted-foreground/60" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Missing backend config for Free tier.</li>
              )}
            </ul>

            <Button variant="outline" className="w-full" onClick={handleFreePlan}>
              Continue with Free
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">You can upgrade anytime</p>
          </Card>

          {/* Pro Plan */}
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
                  {selectedProConfig ? formatPrice(selectedProConfig.price_yearly_cents) : "€—"}
                </span>
                <span className="text-muted-foreground text-sm">/ one-time payment</span>
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
              {selectedProConfig ? (
                [
                  formatLimit("Visual Download", "Visual Downloads", selectedProConfig.downloads_limit),
                  formatLimit("Event", "Events", selectedProConfig.events_limit),
                  formatLimit("Template", "Templates", selectedProConfig.templates_limit),
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_PRO,
                  ONBOARDING_OPTIONAL,
                ].map((item, idx) => (
                  <li key={`${item}-${idx}`} className="flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span className={idx === 0 ? "font-medium" : ""}>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Missing backend config for selected Pro tier.</li>
              )}
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
              {enterpriseConfig ? (
                [
                  `Custom Visual Downloads (> ${maxProDownloads} or unlimited)`,
                  isUnlimited(enterpriseConfig.events_limit)
                    ? "Unlimited Events"
                    : `Custom Events (from ${enterpriseConfig.events_limit}+)`,
                  isUnlimited(enterpriseConfig.templates_limit)
                    ? "Unlimited Templates"
                    : `Custom Templates (from ${enterpriseConfig.templates_limit}+)`,
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_PRO,
                  ONBOARDING_OPTIONAL,
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-foreground">
                    <Check className="h-4 w-4 text-primary" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-muted-foreground">Missing backend config for Enterprise tier.</li>
              )}
            </ul>

            <Button variant="secondary" className="w-full" onClick={() => setCustomPackageDialogOpen(true)}>
              Contact Us
            </Button>
            <p className="text-xs text-muted-foreground text-center mt-3">Tailored to your needs</p>
          </Card>
        </div>

        {/* Footnote (same as landing pricing) */}
        <p className="mt-8 text-center text-xs md:text-sm text-muted-foreground max-w-3xl mx-auto">
          {VISUAL_DOWNLOADS_FOOTNOTE}
        </p>
      </div>

      <CustomPackageDialog
        open={customPackageDialogOpen}
        onOpenChange={setCustomPackageDialogOpen}
        userEmail={userEmail}
        userName={userName}
      />
    </div>
  );
}
