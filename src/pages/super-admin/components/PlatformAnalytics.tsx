import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface DailyData {
  date: string;
  views: number;
  uploads: number;
  downloads: number;
}

interface EventStats {
  id: string;
  name: string;
  slug: string;
  totalViews: number;
  totalDownloads: number;
}

export default function PlatformAnalytics() {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [topEvents, setTopEvents] = useState<EventStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch daily stats for last 30 days
        const thirtyDaysAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
        
        const { data: dailyStats } = await supabase
          .from('event_stats_daily')
          .select('date, views_count, uploads_count, downloads_count')
          .gte('date', thirtyDaysAgo)
          .order('date', { ascending: true });

        // Aggregate by date
        const dateMap = new Map<string, DailyData>();
        dailyStats?.forEach((row) => {
          const existing = dateMap.get(row.date) || { date: row.date, views: 0, uploads: 0, downloads: 0 };
          existing.views += row.views_count || 0;
          existing.uploads += row.uploads_count || 0;
          existing.downloads += row.downloads_count || 0;
          dateMap.set(row.date, existing);
        });
        
        setDailyData(Array.from(dateMap.values()));

        // Fetch top events by views
        const { data: events } = await supabase
          .from('events')
          .select('id, name, slug');

        const { data: allStats } = await supabase
          .from('event_stats_daily')
          .select('event_id, views_count, downloads_count');

        // Aggregate stats per event
        const eventStatsMap = new Map<string, { views: number; downloads: number }>();
        allStats?.forEach((row) => {
          const existing = eventStatsMap.get(row.event_id) || { views: 0, downloads: 0 };
          existing.views += row.views_count || 0;
          existing.downloads += row.downloads_count || 0;
          eventStatsMap.set(row.event_id, existing);
        });

        const eventStats: EventStats[] = (events || [])
          .map((event) => ({
            id: event.id,
            name: event.name,
            slug: event.slug,
            totalViews: eventStatsMap.get(event.id)?.views || 0,
            totalDownloads: eventStatsMap.get(event.id)?.downloads || 0,
          }))
          .sort((a, b) => b.totalViews - a.totalViews)
          .slice(0, 10);

        setTopEvents(eventStats);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  const totalViews = dailyData.reduce((sum, d) => sum + d.views, 0);
  const totalUploads = dailyData.reduce((sum, d) => sum + d.uploads, 0);
  const totalDownloads = dailyData.reduce((sum, d) => sum + d.downloads, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Platform Analytics</h1>
        <p className="text-muted-foreground">Aggregated statistics across all events (last 30 days)</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Views</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Uploads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUploads.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Downloads</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalDownloads.toLocaleString()}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daily Trends</CardTitle>
          <CardDescription>Views, uploads, and downloads over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="date" 
                  stroke="hsl(var(--muted-foreground))"
                  tickFormatter={(value) => format(new Date(value), 'MMM d')}
                />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  labelFormatter={(value) => format(new Date(value), 'MMMM d, yyyy')}
                />
                <Line 
                  type="monotone" 
                  dataKey="views" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="uploads" 
                  stroke="hsl(var(--secondary))" 
                  strokeWidth={2}
                  dot={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="downloads" 
                  stroke="hsl(120 60% 50%)" 
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top Events by Views</CardTitle>
          <CardDescription>Most popular events on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topEvents} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis type="number" stroke="hsl(var(--muted-foreground))" />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  width={150}
                  tickFormatter={(value) => value.length > 20 ? value.substring(0, 20) + '...' : value}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="totalViews" fill="hsl(var(--primary))" name="Views" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
