import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TierKey = "free" | "starter" | "pro" | "premium" | "enterprise";

type TierConfig = {
  id: string;
  tier: TierKey;
  downloads_limit: number; // -1 = unlimited
  events_limit: number; // -1 = unlimited
  templates_limit: number; // -1 = unlimited
  price_yearly_cents: number;
  currency: string; // "EUR"
  stripe_price_id: string | null;
  updated_at: string;
};

const TIER_ORDER: TierKey[] = ["free", "starter", "pro", "premium", "enterprise"];

const isUnlimited = (n: number) => n === -1;
const formatPriceEUR = (cents: number) => `€${Math.round((cents || 0) / 100)}`;
const formatLimit = (label: string, n: number) => {
  if (isUnlimited(n)) return `Unlimited ${label}`;
  return `${n} ${label}${n === 1 ? "" : "s"}`;
};

export default function PricingSection() {
  const navigate = useNavigate();
  const [configs, setConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);

  const scrollToContact = () => {
    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    let channel: any;

    const fetchConfigs = async () => {
      setLoading(true);
      const { data, error } = await supabase.from("subscription_tier_config").select("*").in("tier", TIER_ORDER);

      if (!error && data) {
        const sorted = (data as TierConfig[]).sort((a, b) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
        setConfigs(sorted);
      }
      setLoading(false);
    };

    fetchConfigs();

    channel = supabase
      .channel("subscription_tier_config_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "subscription_tier_config" }, () => fetchConfigs())
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

  const free = tierMap.get("free");
  const enterprise = tierMap.get("enterprise");

  const proOptions = useMemo(() => {
    const arr = (["starter", "pro", "premium"] as TierKey[]).map((t) => tierMap.get(t)).filter(Boolean) as TierConfig[];

    // order by downloads (250, 500, 1000 etc)
    return arr.sort((a, b) => (a.downloads_limit ?? 0) - (b.downloads_limit ?? 0));
  }, [tierMap]);

  const [selectedProTier, setSelectedProTier] = useState<TierKey>("pro");

  useEffect(() => {
    // if selected tier doesn't exist, fallback to middle option or first
    if (!tierMap.get(selectedProTier)) {
      setSelectedProTier(proOptions[1]?.tier ?? proOptions[0]?.tier ?? "pro");
    }
  }, [tierMap, proOptions, selectedProTier]);

  const selectedPro = tierMap.get(selectedProTier) ?? proOptions[0];

  // You can tweak these texts anytime (limits and prices are backend-driven)
  const proPerksByTier: Record<TierKey, string[]> = {
    free: [],
    starter: ["Basic analytics", "Email support"],
    pro: ["Advanced analytics", "Custom branding", "Priority email support"],
    premium: ["Advanced analytics", "Custom branding", "Priority support"],
    enterprise: [],
  };

  if (loading) {
    return (
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-accent bg-clip-text text-transparent"> Invest in Results</span> not Agencies
          </h2>
          <p className="text-sm text-muted-foreground">
            All plans are billed annually (one-time payment). Limits apply per year.
          </p>
        </div>

        <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-3 max-w-5xl mx-auto">
          {/* Free */}
          <Card className="p-8 bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="text-sm text-muted-foreground">For trying out meetme</p>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                {free ? formatPriceEUR(free.price_yearly_cents) : "€0"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Forever • No credit card required</p>
            </div>

            <ul className="mb-6 space-y-3">
              {free ? (
                [
                  formatLimit("download", free.downloads_limit),
                  formatLimit("event", free.events_limit),
                  formatLimit("template", free.templates_limit),
                  "Basic analytics",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing backend config for free tier.</li>
              )}
            </ul>

            <Button className="w-full" variant="outline" onClick={() => navigate("/admin/register")}>
              Get Started
            </Button>
          </Card>

          {/* Pro (dynamic options from starter/pro/premium tiers) */}
          <Card className="p-8 bg-gradient-card border-primary/50 border-2 relative shadow-glow">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-accent text-primary-foreground px-6 py-1.5 rounded-full text-sm font-semibold shadow-glow">
              Most Popular
            </div>

            <div className="mb-2">
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-sm text-muted-foreground">Choose your yearly download package</p>
            </div>

            <div className="mb-4">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                    {selectedPro ? formatPriceEUR(selectedPro.price_yearly_cents) : "€—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Billed yearly • One-time payment</p>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {selectedPro
                      ? `${isUnlimited(selectedPro.downloads_limit) ? "∞" : selectedPro.downloads_limit} / year`
                      : ""}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">{selectedPro?.tier}</div>
                </div>
              </div>
            </div>

            {/* Selector buttons */}
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-2">Downloads per year</div>
              <div className="grid grid-cols-3 gap-2">
                {proOptions.map((opt) => {
                  const active = opt.tier === selectedProTier;
                  const label = isUnlimited(opt.downloads_limit) ? "∞" : String(opt.downloads_limit);
                  return (
                    <Button
                      key={opt.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className={active ? "bg-gradient-accent text-primary-foreground hover:opacity-90" : ""}
                      onClick={() => setSelectedProTier(opt.tier)}
                    >
                      {label}
                    </Button>
                  );
                })}
              </div>

              {selectedPro && (
                <div className="mt-2 text-xs text-muted-foreground">
                  Includes{" "}
                  {isUnlimited(selectedPro.events_limit)
                    ? "unlimited events"
                    : `up to ${selectedPro.events_limit} events`}{" "}
                  and{" "}
                  {isUnlimited(selectedPro.templates_limit)
                    ? "unlimited templates"
                    : `up to ${selectedPro.templates_limit} templates`}
                  .
                </div>
              )}
            </div>

            {/* Perks change with selected tier */}
            <ul className="mb-6 space-y-3">
              {selectedPro ? (
                [
                  formatLimit("download", selectedPro.downloads_limit),
                  formatLimit("event", selectedPro.events_limit),
                  formatLimit("template", selectedPro.templates_limit),
                  ...(proPerksByTier[selectedPro.tier] || []),
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing backend config for starter/pro/premium.</li>
              )}
            </ul>

            <Button
              className="w-full bg-gradient-accent text-primary-foreground hover:opacity-90"
              onClick={() => navigate("/admin/register")}
            >
              Get Started
            </Button>
          </Card>

          {/* Enterprise */}
          <Card className="p-8 bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <p className="text-sm text-muted-foreground">Custom, on request</p>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Custom</span>
              <p className="text-xs text-muted-foreground mt-1">Tailored pricing • Annual invoicing</p>
            </div>

            <ul className="mb-6 space-y-3">
              {enterprise ? (
                [
                  formatLimit("download", enterprise.downloads_limit),
                  formatLimit("event", enterprise.events_limit),
                  formatLimit("template", enterprise.templates_limit),
                  "Custom integrations",
                  "Dedicated support",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing backend config for enterprise tier.</li>
              )}
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
