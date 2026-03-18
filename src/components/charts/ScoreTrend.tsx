"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { useApp } from "@/lib/store";
import { getScoreChartData } from "@/lib/chartData";
import { DarkTooltip } from "./ChartTooltip";
import type { TimeRange } from "./TimeRangeSelector";

interface ScoreTrendProps {
  range: TimeRange;
}

function getBarColor(score: number) {
  if (score >= 90) return "#3DFFA0";
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#FFB84D";
  return "#FF6B5E";
}

export function ScoreTrend({ range }: ScoreTrendProps) {
  const { dayLogs } = useApp();
  const data = getScoreChartData(dayLogs, range);

  return (
    <div className="h-64 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 100]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<DarkTooltip formatter={(v) => `${v}%`} />} />
          <Bar
            dataKey="score"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.score)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
