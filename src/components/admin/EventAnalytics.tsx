import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Eye, Download, Upload, Copy } from "lucide-react";

interface Stats {
  totalViews: number;
  totalUploads: number;
  totalDownloads: number;
  totalCaptionCopies: number;
}

interface TemplateStats {
  template_id: string;
  template_name: string;
  views: number;
  downloads: number;
}

export default function EventAnalytics() {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState<Stats>({
    totalViews: 0,
    totalUploads: 0,
    totalDownloads: 0,
    totalCaptionCopies: 0,
  });
  const [templateStats, setTemplateStats] = useState<TemplateStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (eventId) {
      loadAnalytics();
    }
  }, [eventId]);

  const loadAnalytics = async () => {
    try {
      // Load aggregate stats
      const { data: statsData, error: statsError } = await supabase
        .from("event_stats_daily")
        .select("views_count, uploads_count, downloads_count, caption_copies_count, template_id")
        .eq("event_id", eventId);

      if (statsError) throw statsError;

      if (statsData) {
        const totals = statsData.reduce(
          (acc, row) => ({
            totalViews: acc.totalViews + (row.views_count || 0),
            totalUploads: acc.totalUploads + (row.uploads_count || 0),
            totalDownloads: acc.totalDownloads + (row.downloads_count || 0),
            totalCaptionCopies: acc.totalCaptionCopies + (row.caption_copies_count || 0),
          }),
          { totalViews: 0, totalUploads: 0, totalDownloads: 0, totalCaptionCopies: 0 }
        );
        setStats(totals);

        // Aggregate by template
        const templateMap = new Map<string, { views: number; downloads: number }>();
        statsData.forEach((row) => {
          if (row.template_id) {
            const existing = templateMap.get(row.template_id) || { views: 0, downloads: 0 };
            templateMap.set(row.template_id, {
              views: existing.views + (row.views_count || 0),
              downloads: existing.downloads + (row.downloads_count || 0),
            });
          }
        });

        // Load template names
        const { data: templates } = await supabase
          .from("templates")
          .select("id, name")
          .eq("event_id", eventId);

        if (templates) {
          const templateStatsArray: TemplateStats[] = templates.map((t) => ({
            template_id: t.id,
            template_name: t.name,
            views: templateMap.get(t.id)?.views || 0,
            downloads: templateMap.get(t.id)?.downloads || 0,
          }));
          setTemplateStats(templateStatsArray);
        }
      }
    } catch (error: any) {
      console.error("Failed to load analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading analytics...</div>;
  }

  const conversionRate = stats.totalViews > 0 ? (stats.totalDownloads / stats.totalViews) * 100 : 0;

  return (
    <div className="space-y-6 animate-fade-in">
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

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Page Views</p>
              <p className="text-3xl font-bold mt-2">{stats.totalViews}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Eye className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Photo Uploads</p>
              <p className="text-3xl font-bold mt-2">{stats.totalUploads}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Upload className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Downloads</p>
              <p className="text-3xl font-bold mt-2">{stats.totalDownloads}</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Download className="h-6 w-6 text-primary" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Conversion Rate</p>
              <p className="text-3xl font-bold mt-2">{conversionRate.toFixed(1)}%</p>
            </div>
            <div className="h-12 w-12 rounded-full bg-secondary/10 flex items-center justify-center">
              <Copy className="h-6 w-6 text-secondary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Template Performance */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Template Performance</h2>
        {templateStats.length === 0 ? (
          <p className="text-muted-foreground text-center py-8">No template data yet</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Template Name</th>
                  <th className="text-right py-3 px-4 font-medium">Views</th>
                  <th className="text-right py-3 px-4 font-medium">Downloads</th>
                  <th className="text-right py-3 px-4 font-medium">Conversion</th>
                </tr>
              </thead>
              <tbody>
                {templateStats.map((t) => {
                  const conversion = t.views > 0 ? (t.downloads / t.views) * 100 : 0;
                  return (
                    <tr key={t.template_id} className="border-b">
                      <td className="py-3 px-4">{t.template_name}</td>
                      <td className="text-right py-3 px-4">{t.views}</td>
                      <td className="text-right py-3 px-4">{t.downloads}</td>
                      <td className="text-right py-3 px-4">{conversion.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
