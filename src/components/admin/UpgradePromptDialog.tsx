import { Crown, Zap, Rocket, Check } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface UpgradePromptDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  limitType: 'events' | 'templates' | 'downloads';
  currentTier: string;
  currentUsage: number;
  currentLimit: number;
}

const TIER_FEATURES = {
  free: {
    name: 'Free',
    downloads: 50,
    events: 1,
    templates: 1,
    icon: Zap,
    color: 'text-muted-foreground',
  },
  pro: {
    name: 'Pro',
    downloads: 400,
    events: 5,
    templates: 3,
    icon: Rocket,
    color: 'text-primary',
  },
  premium: {
    name: 'Premium',
    downloads: 1000,
    events: -1,
    templates: -1,
    icon: Crown,
    color: 'text-secondary',
  },
};

const LIMIT_MESSAGES = {
  events: "You've reached your event limit",
  templates: "You've reached your template limit for this event",
  downloads: "You've reached your download limit",
};

export default function UpgradePromptDialog({
  open,
  onOpenChange,
  limitType,
  currentTier,
  currentUsage,
  currentLimit,
}: UpgradePromptDialogProps) {
  const getNextTier = () => {
    if (currentTier === 'free' || currentTier === 'starter') return 'pro';
    if (currentTier === 'pro') return 'premium';
    return null;
  };

  const nextTier = getNextTier();
  const nextTierInfo = nextTier ? TIER_FEATURES[nextTier as keyof typeof TIER_FEATURES] : null;

  const formatLimit = (limit: number) => (limit === -1 ? 'Unlimited' : limit.toString());

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Crown className="h-5 w-5 text-secondary" />
            Upgrade Your Plan
          </DialogTitle>
          <DialogDescription>
            {LIMIT_MESSAGES[limitType]}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Current Usage */}
          <div className="p-4 rounded-lg bg-muted">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium capitalize">{limitType}</span>
              <Badge variant="secondary">{currentTier}</Badge>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-background rounded-full overflow-hidden">
                <div 
                  className="h-full bg-destructive" 
                  style={{ width: '100%' }}
                />
              </div>
              <span className="text-sm font-medium">
                {currentUsage} / {formatLimit(currentLimit)}
              </span>
            </div>
          </div>

          {/* Upgrade Options */}
          {nextTierInfo && (
            <Card className="border-primary/50">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <nextTierInfo.icon className={`h-5 w-5 ${nextTierInfo.color}`} />
                  Upgrade to {nextTierInfo.name}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {formatLimit(nextTierInfo.downloads)} downloads
                      {nextTierInfo.downloads > (TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES]?.downloads || 50) && (
                        <span className="text-green-500 ml-1">
                          (+{nextTierInfo.downloads === -1 ? '∞' : nextTierInfo.downloads - (TIER_FEATURES[currentTier as keyof typeof TIER_FEATURES]?.downloads || 50)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {formatLimit(nextTierInfo.events)} events
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>
                      {formatLimit(nextTierInfo.templates)} templates per event
                    </span>
                  </div>
                </div>
                
                <Button className="w-full" size="lg">
                  <Crown className="mr-2 h-4 w-4" />
                  Upgrade to {nextTierInfo.name}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  Contact us to upgrade your subscription
                </p>
              </CardContent>
            </Card>
          )}

          {!nextTierInfo && (
            <p className="text-center text-muted-foreground">
              You're on the highest tier. Contact support if you need additional capacity.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
