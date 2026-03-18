"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useApp } from "@/lib/store";
import { HABIT_LABELS, HABIT_IDS } from "@/types";
import { getFilteredDates } from "@/lib/chartData";
import { DarkTooltip } from "./ChartTooltip";
import type { TimeRange } from "./TimeRangeSelector";

interface HabitRateChartProps {
  range: TimeRange;
}

export function HabitRateChart({ range }: HabitRateChartProps) {
  const { dayLogs } = useApp();
  const dates = getFilteredDates(dayLogs, range);
  const totalDays = dates.length || 1;

  const data = HABIT_IDS.map((habitId) => {
    const completed = dates.filter((d) => dayLogs[d]?.habits[habitId]).length;
    const rate = Math.round((completed / totalDays) * 100);
    return {
      habitId,
      name: HABIT_LABELS[habitId],
      rate,
      completed,
    };
  }).sort((a, b) => b.rate - a.rate);

  return (
    <div className="h-80 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" horizontal={false} />
          <XAxis
            type="number"
            domain={[0, 100]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={180}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 11 }}
          />
          <Tooltip
            content={
              <DarkTooltip formatter={(v) => `${v}%`} />
            }
          />
          <Bar
            dataKey="rate"
            fill="#3DFFA0"
            radius={[0, 4, 4, 0]}
            isAnimationActive
            animationDuration={800}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
