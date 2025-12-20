import { useEffect, useState } from 'react';
import { Save, Settings2, Infinity } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface TierConfig {
  id: string;
  tier: string;
  downloads_limit: number;
  events_limit: number;
  templates_limit: number;
  updated_at: string;
}

const TIER_ORDER = ['free', 'starter', 'pro', 'premium', 'enterprise'];
const TIER_COLORS: Record<string, string> = {
  free: 'border-muted',
  starter: 'border-blue-500/50',
  pro: 'border-primary/50',
  premium: 'border-secondary/50',
  enterprise: 'border-amber-500/50',
};

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
      const { data, error } = await supabase
        .from('subscription_tier_config')
        .select('*')
        .order('tier');

      if (error) throw error;

      // Sort by predefined order
      const sorted = (data || []).sort((a, b) => 
        TIER_ORDER.indexOf(a.tier) - TIER_ORDER.indexOf(b.tier)
      );
      setConfigs(sorted);
    } catch (error) {
      console.error('Error fetching tier configs:', error);
      toast.error('Failed to load tier configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (config: TierConfig, field: keyof TierConfig, value: number | boolean) => {
    const newValue = typeof value === 'boolean' ? (value ? -1 : 1) : value;
    const updated = { ...config, [field]: newValue };
    
    setEditedConfigs(prev => {
      const next = new Map(prev);
      next.set(config.id, updated);
      return next;
    });
  };

  const getDisplayConfig = (config: TierConfig): TierConfig => {
    return editedConfigs.get(config.id) || config;
  };

  const hasChanges = (config: TierConfig): boolean => {
    const edited = editedConfigs.get(config.id);
    if (!edited) return false;
    return (
      edited.downloads_limit !== config.downloads_limit ||
      edited.events_limit !== config.events_limit ||
      edited.templates_limit !== config.templates_limit
    );
  };

  const handleSave = async (config: TierConfig) => {
    const edited = editedConfigs.get(config.id);
    if (!edited) return;

    setSaving(config.id);
    try {
      const { error } = await supabase
        .from('subscription_tier_config')
        .update({
          downloads_limit: edited.downloads_limit,
          events_limit: edited.events_limit,
          templates_limit: edited.templates_limit,
          updated_at: new Date().toISOString(),
        })
        .eq('id', config.id);

      if (error) throw error;

      toast.success(`${config.tier} tier updated`);
      setEditedConfigs(prev => {
        const next = new Map(prev);
        next.delete(config.id);
        return next;
      });
      fetchConfigs();
    } catch (error) {
      console.error('Error saving tier config:', error);
      toast.error('Failed to save changes');
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
          Configure default limits for each subscription tier. Changes apply to new subscriptions.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {configs.map((config) => {
          const displayConfig = getDisplayConfig(config);
          const isUnlimitedDownloads = displayConfig.downloads_limit === -1;
          const isUnlimitedEvents = displayConfig.events_limit === -1;
          const isUnlimitedTemplates = displayConfig.templates_limit === -1;

          return (
            <Card 
              key={config.id} 
              className={`${TIER_COLORS[config.tier] || 'border-muted'} border-2`}
            >
              <CardHeader className="pb-3">
                <CardTitle className="capitalize flex items-center justify-between">
                  {config.tier}
                  {hasChanges(config) && (
                    <span className="text-xs font-normal text-muted-foreground">
                      Unsaved changes
                    </span>
                  )}
                </CardTitle>
                <CardDescription>
                  Configure limits for {config.tier} tier
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Downloads Limit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Downloads Limit</Label>
                    <div className="flex items-center gap-2">
                      <Infinity className="h-4 w-4 text-muted-foreground" />
                      <Switch
                        checked={isUnlimitedDownloads}
                        onCheckedChange={(checked) => 
                          handleChange(config, 'downloads_limit', checked)
                        }
                      />
                    </div>
                  </div>
                  {!isUnlimitedDownloads && (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.downloads_limit}
                      onChange={(e) => 
                        handleChange(config, 'downloads_limit', parseInt(e.target.value) || 1)
                      }
                    />
                  )}
                  {isUnlimitedDownloads && (
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
                        onCheckedChange={(checked) => 
                          handleChange(config, 'events_limit', checked)
                        }
                      />
                    </div>
                  </div>
                  {!isUnlimitedEvents && (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.events_limit}
                      onChange={(e) => 
                        handleChange(config, 'events_limit', parseInt(e.target.value) || 1)
                      }
                    />
                  )}
                  {isUnlimitedEvents && (
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
                        onCheckedChange={(checked) => 
                          handleChange(config, 'templates_limit', checked)
                        }
                      />
                    </div>
                  </div>
                  {!isUnlimitedTemplates && (
                    <Input
                      type="number"
                      min={1}
                      value={displayConfig.templates_limit}
                      onChange={(e) => 
                        handleChange(config, 'templates_limit', parseInt(e.target.value) || 1)
                      }
                    />
                  )}
                  {isUnlimitedTemplates && (
                    <p className="text-sm text-muted-foreground">Unlimited templates</p>
                  )}
                </div>

                <Button
                  onClick={() => handleSave(config)}
                  disabled={!hasChanges(config) || saving === config.id}
                  className="w-full"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {saving === config.id ? 'Saving...' : 'Save Changes'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> Changes to tier configuration only affect new subscriptions. 
            To update existing user limits, use the Subscriptions Manager to edit individual subscriptions 
            or use the "Apply Default Limits" feature.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
