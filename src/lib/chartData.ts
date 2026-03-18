import { format, subDays, parseISO } from "date-fns";
import type { DayLog } from "@/types";
import { getDailyScore } from "./calculations";

export type TimeRange = "7" | "14" | "30" | "all";

export function getFilteredDates(dayLogs: Record<string, DayLog>, range: TimeRange): string[] {
  const today = new Date();
  if (range === "all") {
    const allDates = Object.keys(dayLogs).sort();
    return allDates;
  }
  const n = parseInt(range, 10);
  return Array.from({ length: n }, (_, i) =>
    format(subDays(today, n - 1 - i), "yyyy-MM-dd")
  );
}

export function getScoreChartData(dayLogs: Record<string, DayLog>, range: TimeRange) {
  const dates = getFilteredDates(dayLogs, range);
  return dates.map((date) => {
    const log = dayLogs[date];
    const score = log ? getDailyScore(log) : 0;
    return {
      date: format(parseISO(date), "MMM d"),
      fullDate: date,
      score,
    };
  });
}
