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

const TIER_LABELS: Record<TierKey, string> = {
  free: "Free",
  starter: "Classic",
  pro: "Premium",
  premium: "Platin",
  enterprise: "Enterprise",
};

const isUnlimited = (n: number) => n === -1;

const formatPriceEUR = (cents: number) => `€${Math.round((cents || 0) / 100)}`;

const formatLimit = (singular: string, plural: string, n: number) => {
  if (isUnlimited(n)) return `Unlimited ${plural}`;
  return `${n} ${n === 1 ? singular : plural}`;
};

const formatChipNumber = (n: number) => (isUnlimited(n) ? "∞" : String(n));

const BASE_FEATURES_ALL_PLANS = ["Analytics Dashboard", "Custom Branding"];
const SUPPORT_FREE = "Basic Support";
const SUPPORT_PRO = "Priority Support";
const ONBOARDING_OPTIONAL = "Dedicated Onboarding (Optional)";

const VISUAL_DOWNLOADS_EXPLANATION =
  "Visual Downloads Are Exports Of Your Event Visuals (e.g. Social Posts, Stories, Posters).";

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

  /**
   * ✅ REVERTED: Pro Options Order = Sorted By downloads_limit (like before)
   * This means the selector order will always follow your backend numbers.
   */
  const proOptions = useMemo(() => {
    const arr = (["starter", "pro", "premium"] as TierKey[]).map((t) => tierMap.get(t)).filter(Boolean) as TierConfig[];

    return arr.sort((a, b) => {
      const aVal = a.downloads_limit === -1 ? Number.POSITIVE_INFINITY : (a.downloads_limit ?? 0);
      const bVal = b.downloads_limit === -1 ? Number.POSITIVE_INFINITY : (b.downloads_limit ?? 0);
      return aVal - bVal;
    });
  }, [tierMap]);

  // Largest Pro Package Value (used for Enterprise wording)
  const maxProDownloads = useMemo(() => {
    const nums = proOptions.map((o) => o.downloads_limit).filter((n) => typeof n === "number" && n !== -1) as number[];
    return nums.length ? Math.max(...nums) : 1000;
  }, [proOptions]);

  const [selectedProTier, setSelectedProTier] = useState<TierKey>("pro");

  useEffect(() => {
    if (!tierMap.get(selectedProTier)) {
      setSelectedProTier(proOptions[1]?.tier ?? proOptions[0]?.tier ?? "pro");
    }
  }, [tierMap, proOptions, selectedProTier]);

  const selectedPro = tierMap.get(selectedProTier) ?? proOptions[0];

  if (loading) {
    return (
      <section className="py-16 md:py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 md:py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="mb-10 md:mb-12 text-center">
          <h2 className="mb-3 text-3xl font-bold md:text-4xl">
            <span className="bg-gradient-accent bg-clip-text text-transparent"> Invest in Results</span> not Agencies
          </h2>

          <p className="text-sm md:text-base text-muted-foreground max-w-2xl mx-auto">
            All Plans Are Billed Yearly (One-time Payment). Limits Apply Per Year.
          </p>

          <p className="mt-2 text-xs md:text-sm text-muted-foreground max-w-2xl mx-auto">
            {VISUAL_DOWNLOADS_EXPLANATION}
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 grid-cols-1 md:grid-cols-3 max-w-6xl xl:max-w-7xl mx-auto items-stretch">
          {/* Free */}
          <Card className="p-7 md:p-8 bg-gradient-card border-border/50 hover:border-primary/30 transition-all duration-300 h-full">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Free</h3>
              <p className="text-sm text-muted-foreground">For Trying Out meetme</p>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                {free ? formatPriceEUR(free.price_yearly_cents) : "€0"}
              </span>
              <p className="text-xs text-muted-foreground mt-1">Forever • No Credit Card Required</p>
            </div>

            <ul className="mb-7 space-y-3">
              {free ? (
                [
                  formatLimit("Visual Download", "Visual Downloads", free.downloads_limit),
                  formatLimit("Event", "Events", free.events_limit),
                  formatLimit("Template", "Templates", free.templates_limit),
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_FREE,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing Backend Config For Free Tier.</li>
              )}
            </ul>

            <Button className="w-full" variant="outline" onClick={() => navigate("/admin/register")}>
              Get Started
            </Button>
          </Card>

          {/* Pro */}
          <Card className="p-7 md:p-8 bg-gradient-card border-primary/50 border-2 relative shadow-glow h-full">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-accent text-primary-foreground px-6 py-1.5 rounded-full text-sm font-semibold shadow-glow">
              Most Popular
            </div>

            <div className="mb-2 mt-2">
              <h3 className="text-2xl font-bold">Pro</h3>
              <p className="text-sm text-muted-foreground">Choose Your Yearly Visual Download Package</p>
            </div>

            <div className="mb-5">
              <div className="flex items-end justify-between gap-3">
                <div>
                  <div className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
                    {selectedPro ? formatPriceEUR(selectedPro.price_yearly_cents) : "€—"}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">One-time Payment • No Monthly Fees</p>
                </div>

                <div className="text-right">
                  <div className="text-sm font-semibold">
                    {selectedPro ? `${formatChipNumber(selectedPro.downloads_limit)} / Year` : ""}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {selectedPro ? TIER_LABELS[selectedPro.tier] : ""}
                  </div>
                </div>
              </div>
            </div>

            {/* Selector */}
            <div className="mb-6">
              <div className="text-xs text-muted-foreground mb-2">Visual Downloads Per Year</div>

              <div className="grid grid-cols-3 gap-2">
                {proOptions.map((opt) => {
                  const active = opt.tier === selectedProTier;
                  const dl = formatChipNumber(opt.downloads_limit);
                  const label = TIER_LABELS[opt.tier];

                  return (
                    <Button
                      key={opt.id}
                      type="button"
                      variant={active ? "default" : "outline"}
                      className={[
                        "h-12 md:h-12 rounded-xl flex flex-col items-center justify-center leading-tight",
                        active ? "bg-gradient-accent text-primary-foreground hover:opacity-90" : "",
                      ].join(" ")}
                      onClick={() => setSelectedProTier(opt.tier)}
                    >
                      <span className="text-sm font-semibold">{dl}</span>
                      <span className="text-[11px] opacity-90">{label}</span>
                    </Button>
                  );
                })}
              </div>

              {selectedPro && (
                <div className="mt-3 text-xs md:text-sm text-muted-foreground">
                  Includes{" "}
                  {isUnlimited(selectedPro.events_limit)
                    ? "Unlimited Events"
                    : `Up To ${selectedPro.events_limit} Events`}{" "}
                  And{" "}
                  {isUnlimited(selectedPro.templates_limit)
                    ? "Unlimited Templates"
                    : `Up To ${selectedPro.templates_limit} Templates`}
                  .
                </div>
              )}

              <div className="mt-2 text-[11px] md:text-xs text-muted-foreground">{VISUAL_DOWNLOADS_EXPLANATION}</div>
            </div>

            <ul className="mb-7 space-y-3">
              {selectedPro ? (
                [
                  formatLimit("Visual Download", "Visual Downloads", selectedPro.downloads_limit),
                  formatLimit("Event", "Events", selectedPro.events_limit),
                  formatLimit("Template", "Templates", selectedPro.templates_limit),
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_PRO,
                  ONBOARDING_OPTIONAL,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing Backend Config For Classic/Premium/Platin.</li>
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
          <Card className="p-7 md:p-8 bg-gradient-card border-border/50 hover:border-secondary/30 transition-all duration-300 h-full">
            <div className="mb-2">
              <h3 className="text-2xl font-bold">Enterprise</h3>
              <p className="text-sm text-muted-foreground">Custom, On Request</p>
            </div>

            <div className="mb-4">
              <span className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">Custom</span>
              <p className="text-xs text-muted-foreground mt-1">Tailored Pricing • One-time Payment</p>
            </div>

            <ul className="mb-7 space-y-3">
              {enterprise ? (
                [
                  `Custom Visual Downloads (> ${maxProDownloads} Or Unlimited)`,
                  isUnlimited(enterprise.events_limit)
                    ? "Unlimited Events"
                    : `Custom Events (From ${enterprise.events_limit}+)`,
                  isUnlimited(enterprise.templates_limit)
                    ? "Unlimited Templates"
                    : `Custom Templates (From ${enterprise.templates_limit}+)`,
                  ...BASE_FEATURES_ALL_PLANS,
                  SUPPORT_PRO,
                  ONBOARDING_OPTIONAL,
                ].map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-secondary mt-0.5 shrink-0" />
                    <span className="text-sm md:text-base">{item}</span>
                  </li>
                ))
              ) : (
                <li className="text-sm text-muted-foreground">Missing Backend Config For Enterprise Tier.</li>
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
