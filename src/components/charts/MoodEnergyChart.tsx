"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useApp } from "@/lib/store";
import { getFilteredDates } from "@/lib/chartData";
import { DarkTooltip } from "./ChartTooltip";
import type { TimeRange } from "./TimeRangeSelector";

interface MoodEnergyChartProps {
  range: TimeRange;
}

export function MoodEnergyChart({ range }: MoodEnergyChartProps) {
  const { dayLogs } = useApp();
  const dates = getFilteredDates(dayLogs, range);
  const data = dates.map((date) => {
    const log = dayLogs[date];
    return {
      date: date.slice(5),
      fullDate: date,
      energy: log?.energy ?? 0,
      mood: log?.mood ?? 0,
    };
  });

  return (
    <div className="h-64 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[0, 5]}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<DarkTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span className="text-white/70">{value}</span>
            )}
          />
          <Area
            type="monotone"
            dataKey="energy"
            stroke="#3DFFA0"
            fill="#3DFFA0"
            fillOpacity={0.3}
            name="Energy"
            isAnimationActive
            animationDuration={800}
          />
          <Area
            type="monotone"
            dataKey="mood"
            stroke="#A78BFA"
            fill="#A78BFA"
            fillOpacity={0.3}
            name="Mood"
            isAnimationActive
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
