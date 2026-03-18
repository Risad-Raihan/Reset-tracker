"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  ReferenceLine,
  ReferenceArea,
} from "recharts";
import { useApp } from "@/lib/store";
import { getFilteredDates } from "@/lib/chartData";
import { isSleepOnTime, timeToMinutes } from "@/lib/calculations";
import { DarkTooltip } from "./ChartTooltip";
import type { TimeRange } from "./TimeRangeSelector";

interface SleepChartProps {
  range: TimeRange;
}

function minutesToLabel(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return `${h}:${m.toString().padStart(2, "0")}`;
}

export function SleepChart({ range }: SleepChartProps) {
  const { dayLogs } = useApp();
  const dates = getFilteredDates(dayLogs, range);
  const data = dates.map((date) => {
    const log = dayLogs[date];
    const sleepMin = log?.sleepTime ? timeToMinutes(log.sleepTime) : null;
    const wakeMin = log?.wakeTime ? timeToMinutes(log.wakeTime) : null;
    const sleepOnTime = log?.sleepTime ? isSleepOnTime(log.sleepTime) : null;
    return {
      date,
      shortDate: date.slice(5),
      sleep: sleepMin,
      wake: wakeMin,
      sleepOnTime,
      sleepLabel: sleepMin != null ? minutesToLabel(sleepMin) : "—",
      wakeLabel: wakeMin != null ? minutesToLabel(wakeMin) : "—",
    };
  });

  const goalMin = 23 * 60;

  return (
    <div className="h-64 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis
            dataKey="shortDate"
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <YAxis
            domain={[18 * 60, 24 * 60 + 59]}
            tickFormatter={(v) => `${Math.floor(v / 60)}:00`}
            stroke="rgba(255,255,255,0.4)"
            tick={{ fontSize: 12 }}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              const p = payload[0]?.payload;
              const sleepMin = p?.sleep;
              const sleepOnTime = p?.sleepOnTime;
              return (
                <div className="rounded-lg border border-white/10 bg-surface px-3 py-2 shadow-xl">
                  <p className="mb-1 font-mono text-xs text-white/60">{label}</p>
                  <p className="text-sm font-medium text-white">
                    Bedtime: {sleepMin != null ? minutesToLabel(sleepMin) : "—"}
                  </p>
                  {sleepMin != null && (
                    <p
                      className={`mt-1 text-xs font-medium ${
                        sleepOnTime ? "text-mint" : "text-coral"
                      }`}
                    >
                      {sleepOnTime ? "✓ On time (11 PM–5 AM)" : "⚠ Outside target window"}
                    </p>
                  )}
                </div>
              );
            }}
          />
          <ReferenceArea
            y1={0}
            y2={5 * 60}
            fill="#3DFFA0"
            fillOpacity={0.08}
            stroke="none"
          />
          <ReferenceArea
            y1={23 * 60}
            y2={24 * 60}
            fill="#3DFFA0"
            fillOpacity={0.08}
            stroke="none"
          />
          <ReferenceLine
            y={goalMin}
            stroke="#FFB84D"
            strokeDasharray="4 4"
            label={{ value: "11 PM goal", fill: "#FFB84D", fontSize: 10 }}
          />
          <Area
            type="monotone"
            dataKey="sleep"
            stroke="#5B9DFF"
            fill="#5B9DFF"
            fillOpacity={0.3}
            isAnimationActive
            animationDuration={800}
            dot={(props) => {
              const { cx, cy, payload } = props;
              if (cx == null || cy == null || payload.sleep == null) return null;
              const inWindow = payload.sleepOnTime;
              return (
                <circle
                  cx={cx}
                  cy={cy}
                  r={5}
                  fill={inWindow ? "#3DFFA0" : "#FF6B5E"}
                  stroke={inWindow ? "#3DFFA0" : "#FF6B5E"}
                  strokeWidth={2}
                />
              );
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
