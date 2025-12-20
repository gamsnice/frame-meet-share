import { Download, Calendar, Image, Crown, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface UsageCardProps {
  tier: string;
  downloadsUsed: number;
  downloadsLimit: number;
  eventsCreated: number;
  eventsLimit: number;
  templatesCreated: number;
  onUpgrade: () => void;
}

const TIER_COLORS: Record<string, string> = {
  free: 'bg-muted text-muted-foreground',
  starter: 'bg-blue-500/20 text-blue-400',
  pro: 'bg-primary/20 text-primary',
  premium: 'bg-secondary/20 text-secondary',
  enterprise: 'bg-amber-500/20 text-amber-400',
};

export default function UsageCard({
  tier,
  downloadsUsed,
  downloadsLimit,
  eventsCreated,
  eventsLimit,
  templatesCreated,
  onUpgrade,
}: UsageCardProps) {
  const formatLimit = (used: number, limit: number) => {
    if (limit === -1) return `${used} / ∞`;
    return `${used} / ${limit}`;
  };

  const getProgress = (used: number, limit: number) => {
    if (limit === -1) return 10; // Show small progress for unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (used: number, limit: number) => {
    if (limit === -1) return 'bg-green-500';
    const percentage = (used / limit) * 100;
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const isAtLimit = (used: number, limit: number) => {
    if (limit === -1) return false;
    return used >= limit;
  };

  const showUpgrade = tier === 'free' || tier === 'starter' || tier === 'pro';

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Your Usage
          </CardTitle>
          <Badge className={TIER_COLORS[tier] || TIER_COLORS.free}>
            {tier.charAt(0).toUpperCase() + tier.slice(1)}
          </Badge>
        </div>
        <CardDescription>Track your subscription usage</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Downloads */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Download className="h-4 w-4 text-muted-foreground" />
              <span>Downloads</span>
            </div>
            <span className={`font-medium ${isAtLimit(downloadsUsed, downloadsLimit) ? 'text-destructive' : ''}`}>
              {formatLimit(downloadsUsed, downloadsLimit)}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${getProgressColor(downloadsUsed, downloadsLimit)}`}
              style={{ width: `${getProgress(downloadsUsed, downloadsLimit)}%` }}
            />
          </div>
        </div>

        {/* Events */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>Events</span>
            </div>
            <span className={`font-medium ${isAtLimit(eventsCreated, eventsLimit) ? 'text-destructive' : ''}`}>
              {formatLimit(eventsCreated, eventsLimit)}
            </span>
          </div>
          <div className="relative h-2 bg-muted rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all ${getProgressColor(eventsCreated, eventsLimit)}`}
              style={{ width: `${getProgress(eventsCreated, eventsLimit)}%` }}
            />
          </div>
        </div>

        {/* Templates */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Image className="h-4 w-4 text-muted-foreground" />
              <span>Total Templates</span>
            </div>
            <span className="font-medium">{templatesCreated}</span>
          </div>
        </div>

        {showUpgrade && (
          <Button onClick={onUpgrade} variant="outline" className="w-full mt-2">
            <Crown className="mr-2 h-4 w-4" />
            Upgrade Plan
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
