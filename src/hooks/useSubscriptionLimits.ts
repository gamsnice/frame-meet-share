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
  templates_per_event_limit: number;
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
  canDownload: boolean;
  eventsRemaining: number | null; // null = unlimited
  downloadsRemaining: number | null; // null = unlimited
  checkTemplateLimit: (eventId: string) => Promise<{ allowed: boolean; current: number; limit: number }>;
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
      const [subResult, usageResult, eventsResult] = await Promise.all([
        supabase
          .from('subscriptions')
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

  const canCreateEvent = (() => {
    if (!subscription) return false;
    if (subscription.events_limit === -1) return true;
    return eventCount < subscription.events_limit;
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

  const downloadsRemaining = (() => {
    if (!subscription) return 0;
    if (subscription.downloads_limit === -1) return null;
    return Math.max(0, subscription.downloads_limit - subscription.downloads_used);
  })();

  const checkTemplateLimit = useCallback(async (eventId: string): Promise<{ allowed: boolean; current: number; limit: number }> => {
    if (!subscription) {
      return { allowed: false, current: 0, limit: 0 };
    }

    if (subscription.templates_per_event_limit === -1) {
      return { allowed: true, current: 0, limit: -1 };
    }

    try {
      const { count } = await supabase
        .from('templates')
        .select('id', { count: 'exact', head: true })
        .eq('event_id', eventId);

      const current = count || 0;
      const allowed = current < subscription.templates_per_event_limit;
      
      return { allowed, current, limit: subscription.templates_per_event_limit };
    } catch (error) {
      console.error('Error checking template limit:', error);
      return { allowed: false, current: 0, limit: subscription.templates_per_event_limit };
    }
  }, [subscription]);

  return {
    subscription,
    usage,
    loading,
    canCreateEvent,
    canDownload,
    eventsRemaining,
    downloadsRemaining,
    checkTemplateLimit,
    refresh: fetchData,
  };
}
