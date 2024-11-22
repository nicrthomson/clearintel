"use client";

import { TrendingUp } from "lucide-react";
import { PolarAngleAxis, PolarGrid, Radar, RadarChart } from "recharts";
import { useAnalytics } from "@/app/hooks/useAnalytics";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const EVIDENCE_COLORS = {
  "Digital": "#22c55e",      // green
  "Physical": "#3b82f6",     // blue
  "Storage": "#f59e0b",      // amber
  "Media": "#8b5cf6",        // purple
  "Document": "#ec4899",     // pink
  "Network": "#06b6d4",      // cyan
  "Other": "#64748b"         // slate
};

const chartConfig = {
  count: {
    label: "Evidence Count",
    color: "#22c55e",
  },
  percentage: {
    label: "Distribution",
    color: "#3b82f6",
  },
};

export function EvidenceTypeChart() {
  const { data, loading } = useAnalytics();

  if (loading || !data) {
    return <div>Loading analytics...</div>;
  }

  const totalCount = data.evidenceTypeStats.reduce((sum, stat) => sum + stat._count, 0);

  const chartData = data.evidenceTypeStats.map((stat) => {
    let category = "Other";
    if (/computer|device|hard drive|ssd|usb/i.test(stat.typeName)) category = "Storage";
    else if (/audio|video|image/i.test(stat.typeName)) category = "Media";
    else if (/document|email/i.test(stat.typeName)) category = "Document";
    else if (/cloud|network|social/i.test(stat.typeName)) category = "Network";

    return {
      type: stat.typeName,
      count: stat._count,
      percentage: Math.round((stat._count / totalCount) * 100),
      category
    };
  });

  return (
    <div className="space-y-4">
      <ChartContainer
        config={chartConfig}
        className="mx-auto aspect-square max-h-[250px]"
      >
        <RadarChart data={chartData}>
          <ChartTooltip
            cursor={false}
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const data = payload[0].payload;
                return (
                  <div className="bg-background border rounded-lg shadow-lg p-2">
                    <p className="font-medium">{data.type}</p>
                    <p className="text-sm text-muted-foreground">
                      Count: {data.count}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {data.percentage}% of total
                    </p>
                  </div>
                );
              }
              return null;
            }}
          />
          <PolarAngleAxis 
            dataKey="type"
            tick={{ fill: "hsl(var(--foreground))", fontSize: 12 }}
          />
          <PolarGrid />
          <Radar
            name="Count"
            dataKey="count"
            stroke={chartConfig.count.color}
            fill={chartConfig.count.color}
            fillOpacity={0.3}
          />
          <Radar 
            name="Percentage"
            dataKey="percentage"
            stroke={chartConfig.percentage.color}
            fill={chartConfig.percentage.color}
            fillOpacity={0.3}
          />
        </RadarChart>
      </ChartContainer>

      <div className="flex items-center gap-2 font-medium justify-center">
        {totalCount} Total Evidence Items
        <TrendingUp className="h-4 w-4" />
      </div>

      <div className="flex justify-center gap-4 flex-wrap">
        {Object.entries(chartConfig).map(([key, config]) => (
          <div key={key} className="flex items-center gap-2">
            <div 
              className="h-3 w-3 rounded-full" 
              style={{ backgroundColor: config.color }}
            />
            <span className="text-sm">{config.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
} 