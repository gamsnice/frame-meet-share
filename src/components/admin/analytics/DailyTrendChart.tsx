import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis, Legend, ResponsiveContainer } from "recharts";
import { format } from "date-fns";

interface DailyData {
  date: string;
  views: number;
  uploads: number;
  downloads: number;
}

interface DailyTrendChartProps {
  data: DailyData[];
}

export default function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartConfig = {
    views: {
      label: "Views",
      color: "hsl(var(--primary))",
    },
    uploads: {
      label: "Uploads",
      color: "hsl(var(--chart-uploads))",
    },
    downloads: {
      label: "Downloads",
      color: "hsl(var(--accent))",
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Daily Activity Trend</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorUploads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--chart-uploads))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--chart-uploads))" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDownloads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(var(--accent))" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(var(--accent))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(new Date(value), "MMM dd")}
                className="text-xs"
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Area
                type="monotone"
                dataKey="views"
                stroke="hsl(var(--primary))"
                fillOpacity={1}
                fill="url(#colorViews)"
                name="Views"
              />
              <Area
                type="monotone"
                dataKey="uploads"
                stroke="hsl(var(--chart-uploads))"
                fillOpacity={1}
                fill="url(#colorUploads)"
                name="Uploads"
              />
              <Area
                type="monotone"
                dataKey="downloads"
                stroke="hsl(var(--accent))"
                fillOpacity={1}
                fill="url(#colorDownloads)"
                name="Downloads"
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
