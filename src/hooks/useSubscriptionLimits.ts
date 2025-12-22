import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Subscription {
  id: string;
  user_id: string;
  tier: string;
  status: string;
  downloads_limit: number;
  downloads_used: number;
  events_limit: number;
  templates_limit: number;
}

interface UsageStats {
  total_downloads: number;
  total_events_created: number;
  total_templates_created: number;
}

interface SubscriptionLimits {
  subscription: Subscription | null;
  usage: UsageStats | null;
  loading: boolean;
  canCreateEvent: boolean;
  canCreateTemplate: boolean;
  canDownload: boolean;
  eventsRemaining: number | null; // null = unlimited
  templatesRemaining: number | null; // null = unlimited
  downloadsRemaining: number | null; // null = unlimited
  refresh: () => Promise<void>;
}

export function useSubscriptionLimits(userId: string | null): SubscriptionLimits {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [eventCount, setEventCount] = useState(0);

  const fetchData = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch subscription, usage stats, and event count in parallel
      // Use subscriptions_safe view to exclude Stripe IDs from client
      const [subResult, usageResult, eventsResult] = await Promise.all([
        supabase
          .from('subscriptions_safe')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('user_usage_stats')
          .select('*')
          .eq('user_id', userId)
          .maybeSingle(),
        supabase
          .from('events')
          .select('id', { count: 'exact', head: true })
          .eq('owner_user_id', userId),
      ]);

      if (subResult.data) {
        setSubscription(subResult.data as Subscription);
      }

      if (usageResult.data) {
        setUsage(usageResult.data as UsageStats);
      }

      setEventCount(eventsResult.count || 0);
    } catch (error) {
      console.error('Error fetching subscription limits:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Real-time subscription updates
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`subscription_changes_${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'subscriptions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          console.log('Subscription changed:', payload);
          if (payload.new) {
            setSubscription(payload.new as Subscription);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const canCreateEvent = (() => {
    if (!subscription) return false;
    if (subscription.events_limit === -1) return true;
    return eventCount < subscription.events_limit;
  })();

  const canCreateTemplate = (() => {
    if (!subscription || !usage) return false;
    if (subscription.templates_limit === -1) return true;
    return (usage.total_templates_created || 0) < subscription.templates_limit;
  })();

  const canDownload = (() => {
    if (!subscription) return false;
    if (subscription.downloads_limit === -1) return true;
    return subscription.downloads_used < subscription.downloads_limit;
  })();

  const eventsRemaining = (() => {
    if (!subscription) return 0;
    if (subscription.events_limit === -1) return null;
    return Math.max(0, subscription.events_limit - eventCount);
  })();

  const templatesRemaining = (() => {
    if (!subscription || !usage) return 0;
    if (subscription.templates_limit === -1) return null;
    return Math.max(0, subscription.templates_limit - (usage.total_templates_created || 0));
  })();

  const downloadsRemaining = (() => {
    if (!subscription) return 0;
    if (subscription.downloads_limit === -1) return null;
    return Math.max(0, subscription.downloads_limit - subscription.downloads_used);
  })();

  return {
    subscription,
    usage,
    loading,
    canCreateEvent,
    canCreateTemplate,
    canDownload,
    eventsRemaining,
    templatesRemaining,
    downloadsRemaining,
    refresh: fetchData,
  };
}
