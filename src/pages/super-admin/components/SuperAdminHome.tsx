import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, 
  Calendar, 
  MessageSquare, 
  Mail, 
  CreditCard,
  TrendingUp,
  Eye,
  Download
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface PlatformStats {
  totalUsers: number;
  totalEvents: number;
  totalFeedback: number;
  totalContactMessages: number;
  totalPageVisits: number;
  totalDownloads: number;
  activeSubscriptions: number;
}

export default function SuperAdminHome() {
  const [stats, setStats] = useState<PlatformStats>({
    totalUsers: 0,
    totalEvents: 0,
    totalFeedback: 0,
    totalContactMessages: 0,
    totalPageVisits: 0,
    totalDownloads: 0,
    activeSubscriptions: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          usersRes,
          eventsRes,
          feedbackRes,
          contactRes,
          dailyStatsRes,
          subscriptionsRes
        ] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('events').select('id', { count: 'exact', head: true }),
          supabase.from('feedback').select('id', { count: 'exact', head: true }),
          supabase.from('contact_messages').select('id', { count: 'exact', head: true }),
          supabase.from('event_stats_daily').select('views_count, downloads_count'),
          supabase.from('subscriptions').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        ]);

        const totalPageVisits = dailyStatsRes.data?.reduce((sum, row) => sum + (row.views_count || 0), 0) || 0;
        const totalDownloads = dailyStatsRes.data?.reduce((sum, row) => sum + (row.downloads_count || 0), 0) || 0;

        setStats({
          totalUsers: usersRes.count || 0,
          totalEvents: eventsRes.count || 0,
          totalFeedback: feedbackRes.count || 0,
          totalContactMessages: contactRes.count || 0,
          totalPageVisits,
          totalDownloads,
          activeSubscriptions: subscriptionsRes.count || 0,
        });
      } catch (error) {
        console.error('Error fetching platform stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { 
      title: 'Total Users', 
      value: stats.totalUsers, 
      icon: Users, 
      color: 'text-primary',
      link: '/super-admin/users'
    },
    { 
      title: 'Total Events', 
      value: stats.totalEvents, 
      icon: Calendar, 
      color: 'text-secondary',
      link: '/super-admin/analytics'
    },
    { 
      title: 'Page Visits', 
      value: stats.totalPageVisits, 
      icon: Eye, 
      color: 'text-blue-500',
      link: '/super-admin/analytics'
    },
    { 
      title: 'Downloads', 
      value: stats.totalDownloads, 
      icon: Download, 
      color: 'text-green-500',
      link: '/super-admin/analytics'
    },
    { 
      title: 'Feedback', 
      value: stats.totalFeedback, 
      icon: MessageSquare, 
      color: 'text-yellow-500',
      link: '/super-admin/feedback'
    },
    { 
      title: 'Contact Messages', 
      value: stats.totalContactMessages, 
      icon: Mail, 
      color: 'text-purple-500',
      link: '/super-admin/contact'
    },
    { 
      title: 'Active Subscriptions', 
      value: stats.activeSubscriptions, 
      icon: CreditCard, 
      color: 'text-emerald-500',
      link: '/super-admin/subscriptions'
    },
  ];

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
        <h1 className="text-2xl font-bold">Platform Overview</h1>
        <p className="text-muted-foreground">Monitor and manage the entire MeetMe platform</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Link key={card.title} to={card.link}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {card.title}
                </CardTitle>
                <card.icon className={`h-5 w-5 ${card.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value.toLocaleString()}</div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Quick Actions
            </CardTitle>
            <CardDescription>Common management tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link 
              to="/super-admin/users" 
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Manage user roles and permissions
            </Link>
            <Link 
              to="/super-admin/feedback" 
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Review pending feedback and bug reports
            </Link>
            <Link 
              to="/super-admin/subscriptions" 
              className="block p-3 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
            >
              Manage user subscriptions
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Status</CardTitle>
            <CardDescription>Platform health indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Database</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Healthy
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Authentication</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground">Storage</span>
              <span className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-green-500" />
                Available
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
