import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { Search, CreditCard, MoreVertical } from 'lucide-react';
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
  templates_per_event_limit: number;
  downloads_limit: number;
  downloads_used: number;
  created_at: string;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  user_email: string;
  user_name: string;
}

type SubscriptionTier = 'free' | 'starter' | 'pro' | 'premium' | 'enterprise';
type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'pending';

const TIER_LIMITS: Record<SubscriptionTier, { events: number; templates: number; downloads: number }> = {
  free: { events: 1, templates: 1, downloads: 50 },
  starter: { events: 2, templates: 2, downloads: 100 },
  pro: { events: 5, templates: 3, downloads: 400 },
  premium: { events: -1, templates: -1, downloads: 1000 },
  enterprise: { events: -1, templates: -1, downloads: 5000 },
};

export default function SubscriptionsManager() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSub, setSelectedSub] = useState<SubscriptionWithUser | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editForm, setEditForm] = useState({
    tier: 'free' as SubscriptionTier,
    status: 'active' as SubscriptionStatus,
    events_limit: 1,
    templates_per_event_limit: 1,
    downloads_limit: 50,
  });

  const fetchSubscriptions = async () => {
    try {
      // Fetch subscriptions
      const { data: subsData, error: subsError } = await supabase
        .from('subscriptions')
        .select('*')
        .order('created_at', { ascending: false });

      if (subsError) throw subsError;

      // Fetch users
      const { data: usersData } = await supabase
        .from('users')
        .select('id, email, name');

      const usersMap = new Map(usersData?.map((u) => [u.id, u]) || []);

      const subscriptionsWithUsers: SubscriptionWithUser[] = (subsData || []).map((sub) => {
        const user = usersMap.get(sub.user_id);
        return {
          ...sub,
          user_email: user?.email || 'Unknown',
          user_name: user?.name || 'Unknown',
        };
      });

      setSubscriptions(subscriptionsWithUsers);
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
      templates_per_event_limit: sub.templates_per_event_limit,
      downloads_limit: sub.downloads_limit || 50,
    });
    setEditDialogOpen(true);
  };

  const handleTierChange = (tier: SubscriptionTier) => {
    const limits = TIER_LIMITS[tier];
    setEditForm({
      ...editForm,
      tier,
      events_limit: limits.events,
      templates_per_event_limit: limits.templates,
      downloads_limit: limits.downloads,
    });
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
          templates_per_event_limit: editForm.templates_per_event_limit,
          downloads_limit: editForm.downloads_limit,
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
                  <TableRow key={sub.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{sub.user_name || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{sub.user_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>{getTierBadge(sub.tier)}</TableCell>
                    <TableCell>{getStatusBadge(sub.status)}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{sub.downloads_used || 0} / {sub.downloads_limit === -1 ? '∞' : sub.downloads_limit} downloads</div>
                        <div className="text-muted-foreground">{sub.events_limit === -1 ? '∞' : sub.events_limit} events, {sub.templates_per_event_limit === -1 ? '∞' : sub.templates_per_event_limit} templates/event</div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(sub.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
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
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Subscription</DialogTitle>
            <DialogDescription>
              Update subscription for {selectedSub?.user_email}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Tier</Label>
              <Select value={editForm.tier} onValueChange={(v) => handleTierChange(v as SubscriptionTier)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Free</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
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

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Events Limit</Label>
                <Input
                  type="number"
                  value={editForm.events_limit}
                  onChange={(e) => setEditForm({ ...editForm, events_limit: parseInt(e.target.value) || 1 })}
                />
              </div>
              <div className="space-y-2">
                <Label>Templates/Event</Label>
                <Input
                  type="number"
                  value={editForm.templates_per_event_limit}
                  onChange={(e) => setEditForm({ ...editForm, templates_per_event_limit: parseInt(e.target.value) || 1 })}
                />
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
