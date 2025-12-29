import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { subDays, format, getDay, parseISO } from "date-fns";
import DateRangePicker from "./analytics/DateRangePicker";
import StatsCards from "./analytics/StatsCards";
import DailyTrendChart from "./analytics/DailyTrendChart";
import QuarterHourlyChart from "./analytics/QuarterHourlyChart";
import WeekdayChart from "./analytics/WeekdayChart";
import TemplatePerformanceTable from "./analytics/TemplatePerformanceTable";
import ResetStatsDialog from "./analytics/ResetStatsDialog";
import type { TemplateStats, DailyData, QuarterHourlyData, WeekdayData, AnalyticsStats } from "@/types";

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export default function EventAnalytics() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [dailyData, setDailyData] = useState<DailyData[]>([]);
  const [quarterHourlyData, setQuarterHourlyData] = useState<QuarterHourlyData[]>([]);
  const [weekdayData, setWeekdayData] = useState<WeekdayData[]>([]);
  const [templateStats, setTemplateStats] = useState<TemplateStats[]>([]);
  const [stats, setStats] = useState<AnalyticsStats>({ pageVisits: 0, totalViews: 0, totalUploads: 0, totalDownloads: 0, conversionRate: 0 });

  const loadAnalytics = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      // Build date filter for daily stats
      let dailyQuery = supabase.from("event_stats_daily").select("*").eq("event_id", eventId);
      if (startDate) dailyQuery = dailyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) dailyQuery = dailyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: dailyStats } = await dailyQuery;

      // Build date filter for quarter-hourly stats (15-min intervals)
      let quarterHourlyQuery = supabase.from("event_stats_quarter_hourly").select("*").eq("event_id", eventId);
      if (startDate) quarterHourlyQuery = quarterHourlyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) quarterHourlyQuery = quarterHourlyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: quarterHourlyStats } = await quarterHourlyQuery;

      // Build date filter for hourly stats (legacy fallback)
      let hourlyQuery = supabase.from("event_stats_hourly").select("*").eq("event_id", eventId);
      if (startDate) hourlyQuery = hourlyQuery.gte("date", format(startDate, "yyyy-MM-dd"));
      if (endDate) hourlyQuery = hourlyQuery.lte("date", format(endDate, "yyyy-MM-dd"));

      const { data: hourlyStats } = await hourlyQuery;

      // Process daily stats
      if (dailyStats) {
        // Calculate page visits (page-level views with template_id = null)
        const pageStats = dailyStats.filter(s => s.template_id === null);
        const pageVisits = pageStats.reduce((sum, s) => sum + (s.views_count || 0), 0);
        
        // Calculate overall stats - only count template-specific stats (exclude page-level views)
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

        // Process template stats
        const templateMap = new Map<string, { views: number; uploads: number; downloads: number }>();
        dailyStats.forEach((stat) => {
          if (stat.template_id) {
            const existing = templateMap.get(stat.template_id) || { views: 0, uploads: 0, downloads: 0 };
            templateMap.set(stat.template_id, {
              views: existing.views + (stat.views_count || 0),
              uploads: existing.uploads + (stat.uploads_count || 0),
              downloads: existing.downloads + (stat.downloads_count || 0),
            });
          }
        });

        // Load template names and types
        const { data: templates } = await supabase.from("templates").select("id, name, type").eq("event_id", eventId);

        if (templates) {
          const templateStatsArray: TemplateStats[] = templates.map((t) => {
            const tStats = templateMap.get(t.id) || { views: 0, uploads: 0, downloads: 0 };
            const conversion = tStats.views > 0 ? (tStats.downloads / tStats.views) * 100 : 0;
            return {
              id: t.id,
              name: t.name,
              type: t.type,
              views: tStats.views,
              uploads: tStats.uploads,
              downloads: tStats.downloads,
              conversion,
            };
          });
          setTemplateStats(templateStatsArray);
        }
      }

      // Process quarter-hourly data (15-minute intervals) with fallback to hourly
      const quarterHourlyMap = new Map<string, QuarterHourlyData>();
      // Initialize all 96 time slots (24 hours * 4 quarters)
      for (let h = 0; h < 24; h++) {
        for (let q = 0; q < 4; q++) {
          const key = `${h}-${q}`;
          const minutes = q * 15;
          const timeLabel = `${h.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}`;
          quarterHourlyMap.set(key, { timeLabel, hour: h, quarter: q, views: 0, uploads: 0, downloads: 0 });
        }
      }

      // Check if we have quarter-hourly data
      const hasQuarterHourlyData = quarterHourlyStats && quarterHourlyStats.length > 0;

      if (hasQuarterHourlyData) {
        // Use quarter-hourly data directly
        quarterHourlyStats.forEach((stat) => {
          const key = `${stat.hour}-${stat.quarter}`;
          const existing = quarterHourlyMap.get(key)!;
          quarterHourlyMap.set(key, {
            ...existing,
            views: existing.views + (stat.views_count || 0),
            uploads: existing.uploads + (stat.uploads_count || 0),
            downloads: existing.downloads + (stat.downloads_count || 0),
          });
        });
      } else if (hourlyStats && hourlyStats.length > 0) {
        // Fallback: distribute hourly data evenly across 4 quarters
        hourlyStats.forEach((stat) => {
          const viewsPerQuarter = Math.floor((stat.views_count || 0) / 4);
          const uploadsPerQuarter = Math.floor((stat.uploads_count || 0) / 4);
          const downloadsPerQuarter = Math.floor((stat.downloads_count || 0) / 4);
          
          for (let q = 0; q < 4; q++) {
            const key = `${stat.hour}-${q}`;
            const existing = quarterHourlyMap.get(key)!;
            quarterHourlyMap.set(key, {
              ...existing,
              views: existing.views + viewsPerQuarter,
              uploads: existing.uploads + uploadsPerQuarter,
              downloads: existing.downloads + downloadsPerQuarter,
            });
          }
        });
      }

      // Sort by hour then quarter
      const sorted = Array.from(quarterHourlyMap.values()).sort((a, b) => {
        if (a.hour !== b.hour) return a.hour - b.hour;
        return a.quarter - b.quarter;
      });
      setQuarterHourlyData(sorted);
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  }, [eventId, startDate, endDate]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/admin/events")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Event Analytics</h1>
            <p className="text-muted-foreground">Track performance and engagement</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onDateChange={(start, end) => {
            setStartDate(start);
            setEndDate(end);
          }}
        />
        <ResetStatsDialog eventId={eventId} startDate={startDate} endDate={endDate} onSuccess={loadAnalytics} />
      </div>

      {/* Stats Cards */}
      <StatsCards stats={stats} />

      {/* Charts */}
      {dailyData.length > 0 && (
        <>
          <DailyTrendChart data={dailyData} />
          <div className="grid gap-6 md:grid-cols-2">
            <WeekdayChart data={weekdayData} />
            <QuarterHourlyChart data={quarterHourlyData} />
          </div>
        </>
      )}

      {/* Template Performance */}
      {templateStats.length > 0 && <TemplatePerformanceTable data={templateStats} />}
    </div>
  );
}
