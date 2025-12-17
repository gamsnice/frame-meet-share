import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { format, getDay, parseISO } from "date-fns";
import type { DailyData, HourlyData, WeekdayData, AnalyticsStats } from "@/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

interface UseAnalyticsDataReturn {
  dailyData: DailyData[];
  hourlyData: HourlyData[];
  weekdayData: WeekdayData[];
  stats: AnalyticsStats;
  loading: boolean;
  loadAnalytics: (eventIds: string[], startDate?: Date, endDate?: Date) => Promise<void>;
}

export function useAnalyticsData(): UseAnalyticsDataReturn {
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [hourlyData, setHourlyData] = useState<HourlyData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({
    pageVisits: 0,
    totalViews: 0,
    totalUploads: 0,
    totalDownloads: 0,
    conversionRate: 0,
  });
  const [loading, setLoading] = useState(false);

  const loadAnalytics = useCallback(async (eventIds: string[], startDate?: Date, endDate?: Date) => {
    if (eventIds.length === 0) return;

    setLoading(true);
    try {
      // Build date filter for daily stats
      let dailyQuery = supabase.from("event_stats_daily").select("*").in("event_id", eventIds);
      if (startDate) dailyQuery = dailyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) dailyQuery = dailyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: dailyStats } = await dailyQuery;

      // Build date filter for hourly stats
      let hourlyQuery = supabase.from("event_stats_hourly").select("*").in("event_id", eventIds);
      if (startDate) hourlyQuery = hourlyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) hourlyQuery = hourlyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: hourlyStats } = await hourlyQuery;

      // Process daily stats
      if (dailyStats) {
        // Calculate page visits (page-level views with template_id = null)
        const pageStats = dailyStats.filter(s => s.template_id === null);
        const pageVisits = pageStats.reduce((sum, s) => sum + (s.views_count || 0), 0);
        
        // Calculate overall stats - only count template-specific stats
        const templateStats = dailyStats.filter(s => s.template_id !== null);
        const totalViews = templateStats.reduce((sum, s) => sum + (s.views_count || 0), 0);
        const totalUploads = templateStats.reduce((sum, s) => sum + (s.uploads_count || 0), 0);
        const totalDownloads = templateStats.reduce((sum, s) => sum + (s.downloads_count || 0), 0);
        const conversionRate = totalViews > 0 ? (totalDownloads / totalViews) * 100 : 0;

        setStats({ pageVisits, totalViews, totalUploads, totalDownloads, conversionRate });

        // Process daily trend data
        const dailyMap = new Map<string, DailyData>();
        dailyStats.forEach((stat) => {
          const dateStr = stat.date;
          const existing = dailyMap.get(dateStr) || { date: dateStr, views: 0, uploads: 0, downloads: 0 };
          dailyMap.set(dateStr, {
            date: dateStr,
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        setDailyData(Array.from(dailyMap.values()).sort((a, b) => a.date.localeCompare(b.date)));

        // Process weekday data
        const weekdayMap = new Map<number, WeekdayData>();
        dailyStats.forEach((stat) => {
          const dayOfWeek = getDay(parseISO(stat.date));
          const existing = weekdayMap.get(dayOfWeek) || { day: DAY_NAMES[dayOfWeek], views: 0, uploads: 0, downloads: 0 };
          weekdayMap.set(dayOfWeek, {
            day: DAY_NAMES[dayOfWeek],
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        const sortedWeekdays = Array.from(weekdayMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([, data]) => data);
        setWeekdayData(sortedWeekdays);
      }

      // Process hourly data
      if (hourlyStats) {
        const hourlyMap = new Map<number, HourlyData>();
        for (let i = 0; i < 24; i++) {
          hourlyMap.set(i, { hour: i, views: 0, uploads: 0, downloads: 0 });
        }
        hourlyStats.forEach((stat) => {
          const existing = hourlyMap.get(stat.hour)!;
          hourlyMap.set(stat.hour, {
            hour: stat.hour,
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
        setHourlyData(Array.from(hourlyMap.values()));
      }
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    dailyData,
    hourlyData,
    weekdayData,
    stats,
    loading,
    loadAnalytics,
  };
}
