import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search, MoreVertical, ChevronDown, ChevronRight, Download, Calendar, Image } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SubscriptionWithUser {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  events_limit: number;
  templates_limit: number;
  downloads_limit: number;
  downloads_used: number;
  created_at: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  user_email: string;
  user_name: string;
  events_created: number;
  templates_created: number;
}

interface TierConfig {
  tier: string;
  downloads_limit: number;
  events_limit: number;
  templates_limit: number;
}

type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium' | 'enterprise';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

export default function SubscriptionsManager() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [tierConfigs, setTierConfigs] = useState<TierConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubscriptionWithUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expandedSubId, setExpandedSubId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    tier: 'free' as SubscriptionTier,
    status: 'active' as SubscriptionStatus,
    events_limit: 1,
    templates_limit: 1,
    downloads_limit: 50,
    downloads_used: 0,
  });

  const toggleExpanded = (id: string) => {
    setExpandedSubId(expandedSubId === id ? null : id);
  };

  const formatLimit = (used: number, limit: number) => {
    if (limit === -1) return `${used} / ∞`;
    return `${used} / ${limit}`;
  };

  const getProgress = (used: number, limit: number) => {
    if (limit === -1) return 10;
    return Math.min((used / limit) * 100, 100);
  };

  const getProgressColor = (used: number, limit: number) => {
    if (limit === -1) return 'bg-green-500';
    const percentage = (used / limit) * 100;
    if (percentage >= 100) return 'bg-destructive';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-primary';
  };

  const getRemainingText = (used: number, limit: number) => {
    if (limit === -1) return 'unlimited';
    const remaining = Math.max(0, limit - used);
    if (remaining === 0) return 'at limit!';
    return `${remaining} left`;
  };

  const fetchSubscriptions = async () => {
    try {
      // Fetch subscriptions, users, tier configs, and usage stats in parallel
      const [subsResult, usersResult, tierResult, usageResult] = await Promise.all([
        supabase.from('subscriptions').select('*').order('created_at', { ascending: false }),
        supabase.from('users').select('id, email, name'),
        supabase.from('subscription_tier_config').select('*'),
        supabase.from('user_usage_stats').select('*'),
      ]);

      if (subsResult.error) throw subsResult.error;

      const usersMap = new Map(usersResult.data?.map((u) => [u.id, u]) || []);
      const usageMap = new Map(usageResult.data?.map((u) => [u.user_id, u]) || []);

      const subscriptionsWithUsers: SubscriptionWithUser[] = (subsResult.data || []).map((sub) => {
        const user = usersMap.get(sub.user_id);
        const usage = usageMap.get(sub.user_id);
        return {
          ...sub,
          user_email: user?.email || 'Unknown',
          user_name: user?.name || 'Unknown',
          events_created: usage?.total_events_created || 0,
          templates_created: usage?.total_templates_created || 0,
        };
      });

      setSubscriptions(subscriptionsWithUsers);
      setTierConfigs(tierResult.data || []);
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const openEditDialog = (sub: SubscriptionWithUser) => {
    setSelectedSub(sub);
    setEditForm({
      tier: sub.tier as SubscriptionTier,
      status: sub.status as SubscriptionStatus,
      events_limit: sub.events_limit,
      templates_limit: sub.templates_limit,
      downloads_limit: sub.downloads_limit || 50,
      downloads_used: sub.downloads_used || 0,
    });
    setEditDialogOpen(true);
  };

  const handleTierChange = (tier: SubscriptionTier) => {
    const config = tierConfigs.find((c) => c.tier === tier);
    if (config) {
      setEditForm({
        ...editForm,
        tier,
        events_limit: config.events_limit,
        templates_limit: config.templates_limit,
        downloads_limit: config.downloads_limit,
      });
    } else {
      setEditForm({ ...editForm, tier });
    }
  };

  const handleSaveChanges = async () => {
    if (!selectedSub) return;

    try {
      const { error } = await supabase
        .from('subscriptions')
        .update({
          tier: editForm.tier,
          status: editForm.status,
          events_limit: editForm.events_limit,
          templates_limit: editForm.templates_limit,
          downloads_limit: editForm.downloads_limit,
          downloads_used: editForm.downloads_used,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedSub.id);

      if (error) throw error;

      toast.success('Subscription updated');
      setEditDialogOpen(false);
      fetchSubscriptions();
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast.error('Failed to update subscription');
    }
  };

  const getTierBadge = (tier: string) => {
    const colors: Record<string, string> = {
      free: 'bg-muted text-muted-foreground',
      starter: 'bg-blue-500/20 text-blue-400',
      pro: 'bg-primary/20 text-primary',
      premium: 'bg-secondary/20 text-secondary',
      enterprise: 'bg-amber-500/20 text-amber-400',
    };
    return <Badge className={colors[tier] || colors.free}>{tier}</Badge>;
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-500/20 text-green-400',
      cancelled: 'bg-red-500/20 text-red-400',
      expired: 'bg-muted text-muted-foreground',
      pending: 'bg-yellow-500/20 text-yellow-400',
    };
    return <Badge className={colors[status] || colors.active}>{status}</Badge>;
  };

  const filteredSubscriptions = subscriptions.filter(
    (sub) =>
      sub.user_email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const tierCounts = subscriptions.reduce(
    (acc, sub) => {
      acc[sub.tier] = (acc[sub.tier] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

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
        <h1 className="text-2xl font-bold">Subscriptions Manager</h1>
        <p className="text-muted-foreground">Manage user subscriptions and limits</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {(['free', 'starter', 'pro', 'enterprise'] as const).map((tier) => (
          <Card key={tier}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground capitalize">
                {tier}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{tierCounts[tier] || 0}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle>All Subscriptions</CardTitle>
              <CardDescription>{subscriptions.length} total subscriptions</CardDescription>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by email or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Limits</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="w-12"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSubscriptions.map((sub) => (
                  <>
                    <TableRow 
                      key={sub.id} 
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleExpanded(sub.id)}
                    >
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {expandedSubId === sub.id ? (
                            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                          )}
                          <div>
                            <div className="font-medium">{sub.user_name || 'No name'}</div>
                            <div className="text-sm text-muted-foreground">{sub.user_email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTierBadge(sub.tier)}</TableCell>
                      <TableCell>{getStatusBadge(sub.status)}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <div>{sub.downloads_used || 0} / {sub.downloads_limit === -1 ? '∞' : sub.downloads_limit} downloads</div>
                          <div className="text-muted-foreground">{sub.events_limit === -1 ? '∞' : sub.events_limit} events, {sub.templates_limit === -1 ? '∞' : sub.templates_limit} templates</div>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(new Date(sub.created_at), 'MMM d, yyyy')}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(sub)}>
                              Edit Subscription
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                    {expandedSubId === sub.id && (
                      <TableRow className="bg-muted/30 hover:bg-muted/30">
                        <TableCell colSpan={6} className="py-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6">
                            {/* Downloads */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Download className="h-3 w-3" /> Downloads
                                </span>
                                <span className="font-medium">{formatLimit(sub.downloads_used || 0, sub.downloads_limit)}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${getProgressColor(sub.downloads_used || 0, sub.downloads_limit)}`} 
                                  style={{ width: `${getProgress(sub.downloads_used || 0, sub.downloads_limit)}%` }} 
                                />
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {getRemainingText(sub.downloads_used || 0, sub.downloads_limit)}
                              </div>
                            </div>
                            {/* Events */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Calendar className="h-3 w-3" /> Events
                                </span>
                                <span className="font-medium">{formatLimit(sub.events_created, sub.events_limit)}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${getProgressColor(sub.events_created, sub.events_limit)}`} 
                                  style={{ width: `${getProgress(sub.events_created, sub.events_limit)}%` }} 
                                />
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {getRemainingText(sub.events_created, sub.events_limit)}
                              </div>
                            </div>
                            {/* Templates */}
                            <div className="space-y-1.5">
                              <div className="flex items-center justify-between text-xs">
                                <span className="flex items-center gap-1.5 text-muted-foreground">
                                  <Image className="h-3 w-3" /> Templates
                                </span>
                                <span className="font-medium">{formatLimit(sub.templates_created, sub.templates_limit)}</span>
                              </div>
                              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className={`h-full transition-all ${getProgressColor(sub.templates_created, sub.templates_limit)}`} 
                                  style={{ width: `${getProgress(sub.templates_created, sub.templates_limit)}%` }} 
                                />
                              </div>
                              <div className="text-xs text-muted-foreground text-right">
                                {getRemainingText(sub.templates_created, sub.templates_limit)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription for {selectedSub?.user_email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tier</Label>
                <Select value={editForm.tier} onValueChange={(v) => handleTierChange(v as SubscriptionTier)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {tierConfigs
                      .sort((a, b) => {
                        const order = ['free', 'starter', 'pro', 'premium', 'enterprise'];
                        return order.indexOf(a.tier) - order.indexOf(b.tier);
                      })
                      .map((config) => (
                        <SelectItem key={config.tier} value={config.tier}>
                          <span className="capitalize">{config.tier}</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={editForm.status} onValueChange={(v) => setEditForm({ ...editForm, status: v as SubscriptionStatus })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                    <SelectItem value="expired">Expired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Tier defaults info */}
            {tierConfigs.find((c) => c.tier === editForm.tier) && (
              <div className="p-3 rounded-lg bg-muted/50 border border-border">
                <p className="text-xs text-muted-foreground mb-2">
                  <span className="capitalize font-medium text-foreground">{editForm.tier}</span> tier defaults:
                </p>
                <div className="flex gap-4 text-xs">
                  <span>
                    Downloads: {tierConfigs.find((c) => c.tier === editForm.tier)?.downloads_limit === -1 ? '∞' : tierConfigs.find((c) => c.tier === editForm.tier)?.downloads_limit}
                  </span>
                  <span>
                    Events: {tierConfigs.find((c) => c.tier === editForm.tier)?.events_limit === -1 ? '∞' : tierConfigs.find((c) => c.tier === editForm.tier)?.events_limit}
                  </span>
                  <span>
                    Templates: {tierConfigs.find((c) => c.tier === editForm.tier)?.templates_limit === -1 ? '∞' : tierConfigs.find((c) => c.tier === editForm.tier)?.templates_limit}
                  </span>
                </div>
              </div>
            )}

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Limits</Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => {
                    const config = tierConfigs.find((c) => c.tier === editForm.tier);
                    if (config) {
                      setEditForm({
                        ...editForm,
                        downloads_limit: config.downloads_limit,
                        events_limit: config.events_limit,
                        templates_limit: config.templates_limit,
                      });
                    }
                  }}
                >
                  Reset to tier defaults
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Downloads Used</Label>
                  <Input
                    type="number"
                    value={editForm.downloads_used}
                    onChange={(e) => setEditForm({ ...editForm, downloads_used: parseInt(e.target.value) || 0 })}
                    min={0}
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Downloads Limit</Label>
                  <Input
                    type="number"
                    value={editForm.downloads_limit}
                    onChange={(e) => setEditForm({ ...editForm, downloads_limit: parseInt(e.target.value) || 50 })}
                    min={-1}
                  />
                  <p className="text-xs text-muted-foreground">-1 = unlimited</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Events Limit</Label>
                  <Input
                    type="number"
                    value={editForm.events_limit}
                    onChange={(e) => setEditForm({ ...editForm, events_limit: parseInt(e.target.value) || 1 })}
                    min={-1}
                  />
                  <p className="text-xs text-muted-foreground">-1 = unlimited</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Templates Limit</Label>
                  <Input
                    type="number"
                    value={editForm.templates_limit}
                    onChange={(e) => setEditForm({ ...editForm, templates_limit: parseInt(e.target.value) || 1 })}
                    min={-1}
                  />
                  <p className="text-xs text-muted-foreground">-1 = unlimited</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveChanges}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
