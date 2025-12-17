import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, Upload, Download, TrendingUp, Users } from "lucide-react";

interface Stats {
  pageVisits: number;
  totalViews: number;
  totalUploads: number;
  totalDownloads: number;
  conversionRate: number;
}

interface StatsCardsProps {
  stats: Stats;
}

export default function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      title: "Page Visits",
      value: stats.pageVisits.toLocaleString(),
      icon: Users,
      color: "text-muted-foreground",
    },
    {
      title: "Template Views",
      value: stats.totalViews.toLocaleString(),
      icon: Eye,
      color: "text-primary",
    },
    {
      title: "Uploads",
      value: stats.totalUploads.toLocaleString(),
      icon: Upload,
      color: "text-secondary",
    },
    {
      title: "Downloads",
      value: stats.totalDownloads.toLocaleString(),
      icon: Download,
      color: "text-accent",
    },
    {
      title: "Conversion",
      value: `${stats.conversionRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-primary",
    },
  ];

  return (
    <div className="grid gap-3 sm:gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <card.icon className={`h-4 w-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
