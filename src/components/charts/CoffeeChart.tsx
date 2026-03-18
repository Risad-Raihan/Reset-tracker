"use client";

import {
  ComposedChart,
  Bar,
  Line,
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

interface CoffeeChartProps {
  range: TimeRange;
}

function timeToMinutes(time: string): number {
  if (!time) return 0;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function CoffeeChart({ range }: CoffeeChartProps) {
  const { dayLogs } = useApp();
  const dates = getFilteredDates(dayLogs, range);
  const data = dates.map((date) => {
    const log = dayLogs[date];
    return {
      date: date.slice(5),
      fullDate: date,
      coffee: log?.coffee ?? 0,
      sleepMin: log?.sleepTime ? timeToMinutes(log.sleepTime) : null,
    };
  });

  return (
    <div className="h-64 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="date"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="left"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
            tickFormatter={() => ""}
          />
          <Tooltip content={<DarkTooltip />} />
          <Legend
            wrapperStyle={{ fontSize: 12 }}
            formatter={(value) => (
              <span className="text-white/70">{value}</span>
            )}
          />
          <Bar
            yAxisId="left"
            dataKey="coffee"
            fill="#FFB84D"
            radius={[4, 4, 0, 0]}
            name="Coffee cups"
            isAnimationActive
            animationDuration={800}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="sleepMin"
            stroke="#5B9DFF"
            strokeWidth={2}
            dot={false}
            name="Bedtime (min)"
            isAnimationActive
            animationDuration={800}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
