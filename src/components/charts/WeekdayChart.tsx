"use client";

import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { useApp } from "@/lib/store";
import { getDailyScore } from "@/lib/calculations";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function WeekdayChart() {
  const { dayLogs } = useApp();

  const dayScores: Record<number, number[]> = {};
  for (let i = 0; i < 7; i++) dayScores[i] = [];

  Object.entries(dayLogs).forEach(([date, log]) => {
    const d = new Date(date + "T12:00:00");
    const day = d.getDay();
    dayScores[day].push(getDailyScore(log));
  });

  const data = DAY_NAMES.map((name, i) => {
    const scores = dayScores[i];
    const avg = scores.length
      ? Math.round(
          scores.reduce((a, b) => a + b, 0) / scores.length
        )
      : 0;
    return {
      day: name,
      score: avg,
      fullMark: 100,
    };
  });

  return (
    <div className="h-64 min-h-[200px]">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.2)" />
          <PolarAngleAxis
            dataKey="day"
            tick={{ fill: "rgba(255,255,255,0.8)", fontSize: 12 }}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "rgba(255,255,255,0.5)", fontSize: 10 }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "#111114",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
            }}
            formatter={(value: unknown) => [`${value != null ? value : 0}%`, "Avg score"]}
          />
          <Radar
            name="Avg score"
            dataKey="score"
            stroke="#3DFFA0"
            fill="#3DFFA0"
            fillOpacity={0.3}
            isAnimationActive
            animationDuration={800}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
