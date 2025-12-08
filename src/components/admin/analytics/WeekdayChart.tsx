import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer } from "recharts";

interface WeekdayData {
  day: string;
  views: number;
  uploads: number;
  downloads: number;
}

interface WeekdayChartProps {
  data: WeekdayData[];
}

export default function WeekdayChart({ data }: WeekdayChartProps) {
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
<Card className="overflow-hidden max-w-full">
  <CardHeader>
        <CardTitle>Activity by Day of Week</CardTitle>
      </CardHeader>
      <CardContent className="overflow-hidden p-3 sm:p-6">
        <ChartContainer config={chartConfig} className="h-[250px] sm:h-[300px] w-full min-w-0 max-w-full">
          <ResponsiveContainer width="99%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
              <XAxis 
                dataKey="day" 
                className="text-xs" 
                tick={{ fontSize: 10 }}
                tickFormatter={(value) => value.substring(0, 3)}
              />
              <YAxis className="text-xs" />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="views" fill="hsl(var(--primary))" name="Views" />
              <Bar dataKey="uploads" fill="hsl(var(--chart-uploads))" name="Uploads" />
              <Bar dataKey="downloads" fill="hsl(var(--accent))" name="Downloads" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
