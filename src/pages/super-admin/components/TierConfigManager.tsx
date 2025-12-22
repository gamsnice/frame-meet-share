import { useEffect, useState } from "react";
import { Save, Settings2, Infinity } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface TierConfig {
  id: string;
  tier: string; // keep DB keys: free, starter, pro, premium, enterprise
  downloads_limit: number; // -1 = unlimited
  events_limit: number; // -1 = unlimited
  templates_limit: number; // -1 = unlimited
  price_yearly_cents: number; // stored as cents
  currency: string; // "EUR"
  stripe_price_id: string | null;
  updated_at: string;
}

const TIER_ORDER = ["free", "starter", "pro", "premium", "enterprise"];
const TIER_COLORS: Record<string, string> = {
  free: "border-muted",
  starter: "border-blue-500/50",
  pro: "border-primary/50",
  premium: "border-secondary/50",
  enterprise: "border-amber-500/50",
};

// UI labels (what you show to users/admin)
// DB keys stay unchanged.
const TIER_LABELS: Record<string, string> = {
  free: "Free",
  starter: "Classic",
  pro: "Premium",
  premium: "Platin",
  enterprise: "Enterprise",
};

function tierLabel(tier: string) {
  return TIER_LABELS[tier] ?? tier;
}

export default function TierConfigManager() {
  const [configs, setConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editedConfigs, setEditedConfigs] = useState<Map<string, TierConfig>>(new Map());

  useEffect(() => {
    fetchConfigs();
  }, []);

  const fetchConfigs = async () => {
    try {
      const { data, error } = await supabase.from("subscription_tier_config").select("*").order("tier");
      if (error) throw error;

      const sorted = (data || []).sort((a: any, b: any) => TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier));
      setConfigs(sorted as TierConfig[]);
    } catch (error) {
      console.error("Error fetching tier configs:", error);
      toast.error("Failed to load tier configurations");
    } finally {
      setLoading(false);
    }
  };

  const getDisplayConfig = (config: TierConfig): TierConfig => editedConfigs.get(config.id) || config;

  const setEdited = (configId: string, updated: TierConfig) => {
    setEditedConfigs((prev) => {
      const next = new Map(prev);
      next.set(configId, updated);
      return next;
    });
  };

  const handleLimitToggle = (
    config: TierConfig,
    field: "downloads_limit" | "events_limit" | "templates_limit",
    checked: boolean,
  ) => {
    const updated = { ...getDisplayConfig(config), [field]: checked ? -1 : 1 };
    setEdited(config.id, updated);
  };

  const handleLimitNumber = (
    config: TierConfig,
    field: "downloads_limit" | "events_limit" | "templates_limit",
    value: number,
  ) => {
    const safe = Number.isFinite(value) && value >= 1 ? value : 1;
    const updated = { ...getDisplayConfig(config), [field]: safe };
    setEdited(config.id, updated);
  };

  const handlePriceEuros = (config: TierConfig, euros: number) => {
    const safeEuros = Number.isFinite(euros) && euros >= 0 ? euros : 0;
    const updated = { ...getDisplayConfig(config), price_yearly_cents: safeEuros * 100, currency: "EUR" };
    setEdited(config.id, updated);
  };

  const handleStripePriceId = (config: TierConfig, stripePriceId: string) => {
    const updated = { ...getDisplayConfig(config), stripe_price_id: stripePriceId.trim() || null };
    setEdited(config.id, updated);
  };

  const hasChanges = (config: TierConfig): boolean => {
    const edited = editedConfigs.get(config.id);
    if (!edited) return false;
    return (
      edited.downloads_limit !== config.downloads_limit ||
      edited.events_limit !== config.events_limit ||
      edited.templates_limit !== config.templates_limit ||
      edited.price_yearly_cents !== config.price_yearly_cents ||
      (edited.stripe_price_id || null) !== (config.stripe_price_id || null) ||
      edited.currency !== config.currency
    );
  };

  const handleSave = async (config: TierConfig) => {
    const edited = editedConfigs.get(config.id);
    if (!edited) return;

    setSaving(config.id);
    try {
      const { error } = await supabase
        .from("subscription_tier_config")
        .update({
          downloads_limit: edited.downloads_limit,
          events_limit: edited.events_limit,
          templates_limit: edited.templates_limit,
          price_yearly_cents: edited.price_yearly_cents,
          currency: edited.currency ?? "EUR",
          stripe_price_id: edited.stripe_price_id ?? null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", config.id);

      if (error) throw error;

      toast.success(`${tierLabel(config.tier)} tier updated`);
      setEditedConfigs((prev) => {
        const next = new Map(prev);
        next.delete(config.id);
        return next;
      });
      fetchConfigs();
    } catch (error) {
      console.error("Error saving tier config:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings2 className="h-6 w-6" />
          Tier Configuration
        </h1>
        <p className="text-muted-foreground">
          Configure default limits and pricing for each tier. Changes apply to new subscriptions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {configs.map((config) => {
          const displayConfig = getDisplayConfig(config);

          const isUnlimitedDownloads = displayConfig.downloads_limit === -1;
          const isUnlimitedEvents = displayConfig.events_limit === -1;
          const isUnlimitedTemplates = displayConfig.templates_limit === -1;

          const priceEuros = Math.round((displayConfig.price_yearly_cents || 0) / 100);

          return (
            <Card key={config.id} className={`${TIER_COLORS[config.tier] || "border-muted"} border-2`}>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  {tierLabel(config.tier)}
                  {hasChanges(config) && (
                    <span className="text-xs font-normal text-muted-foreground">Unsaved changes</span>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure limits and pricing for <span className="font-medium">{tierLabel(config.tier)}</span>
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Price */}
                <div className="space-y-2">
                  <Label>Price (Yearly)</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">€</span>
                    <Input
                      type="number"
                      min={0}
                      value={priceEuros}
                      onChange={(e) => handlePriceEuros(config, parseInt(e.target.value || "0", 10))}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Shown as one-time yearly payment. Stored in cents.</p>
                </div>

                {/* Stripe price id (optional) */}
                <div className="space-y-2">
                  <Label>Stripe price id (optional)</Label>
                  <Input
                    placeholder="price_123..."
                    value={displayConfig.stripe_price_id || ""}
                    onChange={(e) => handleStripePriceId(config, e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">Add later when Stripe is integrated.</p>
                </div>

                {/* Downloads Limit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Downloads Limit</Label>
                    <div className="flex items-center gap-2">
                      <Infinity className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={isUnlimitedDownloads}
                        onCheckedChange={(checked) => handleLimitToggle(config, "downloads_limit", checked)}
                      />
                    </div>
                  </div>
                  {!isUnlimitedDownloads ? (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.downloads_limit}
                      onChange={(e) => handleLimitNumber(config, "downloads_limit", parseInt(e.target.value) || 1)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Unlimited downloads</p>
                  )}
                </div>

                {/* Events Limit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Events Limit</Label>
                    <div className="flex items-center gap-2">
                      <Infinity className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={isUnlimitedEvents}
                        onCheckedChange={(checked) => handleLimitToggle(config, "events_limit", checked)}
                      />
                    </div>
                  </div>
                  {!isUnlimitedEvents ? (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.events_limit}
                      onChange={(e) => handleLimitNumber(config, "events_limit", parseInt(e.target.value) || 1)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Unlimited events</p>
                  )}
                </div>

                {/* Templates Limit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Total Templates</Label>
                    <div className="flex items-center gap-2">
                      <Infinity className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={isUnlimitedTemplates}
                        onCheckedChange={(checked) => handleLimitToggle(config, "templates_limit", checked)}
                      />
                    </div>
                  </div>
                  {!isUnlimitedTemplates ? (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.templates_limit}
                      onChange={(e) => handleLimitNumber(config, "templates_limit", parseInt(e.target.value) || 1)}
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Unlimited templates</p>
                  )}
                </div>

                <Button
                  onClick={() => handleSave(config)}
                  disabled={!hasChanges(config) || saving === config.id}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving === config.id ? "Saving..." : "Save Changes"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Changes only affect new subscriptions. To update existing users, use your
            subscriptions manager.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
