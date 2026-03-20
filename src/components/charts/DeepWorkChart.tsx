"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  Cell,
} from "recharts";
import { useApp } from "@/lib/store";
import { getDateRangeForChart } from "@/lib/chartData";
import { DarkTooltip } from "./ChartTooltip";
import type { TimeRange } from "./TimeRangeSelector";

interface DeepWorkChartProps {
  range: TimeRange;
}

function getBarColor(minutes: number) {
  if (minutes >= 120) return "#3DFFA0";
  if (minutes >= 60) return "#FFB84D";
  return "#FF6B5E";
}

function formatMinutes(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export function DeepWorkChart({ range }: DeepWorkChartProps) {
  const { deepWorkDays } = useApp();
  const dates = getDateRangeForChart(range, Object.keys(deepWorkDays));
  const data = dates.map((date) => {
    const day = deepWorkDays[date];
    const minutes = day ? Math.round(day.totalMs / 60000) : 0;
    return {
      date: date.slice(5),
      fullDate: date,
      minutes,
      label: formatMinutes(minutes),
    };
  });

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
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => formatMinutes(v)}
          />
          <Tooltip
            content={
              <DarkTooltip formatter={(v) => formatMinutes(v)} />
            }
          />
          <ReferenceLine
            y={120}
            stroke="#FFB84D"
            strokeDasharray="4 4"
            label={{ value: "2h goal", fill: "#FFB84D", fontSize: 10 }}
          />
          <Bar
            dataKey="minutes"
            name="Deep work"
            radius={[4, 4, 0, 0]}
            isAnimationActive
            animationDuration={800}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={getBarColor(entry.minutes)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
