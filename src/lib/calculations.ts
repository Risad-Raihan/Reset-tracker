import {
  format,
  parseISO,
  differenceInDays,
  differenceInHours,
  startOfWeek,
  endOfWeek,
  subDays,
  addDays,
  isWithinInterval,
  startOfDay,
} from "date-fns";
import type { DayLog, HabitId, Book } from "@/types";

/** Target window: 11 PM (23:00) to 5 AM (05:00) */
const SLEEP_WINDOW_START = 23 * 60;
const SLEEP_WINDOW_END = 5 * 60;

export function timeToMinutes(time: string): number {
  if (!time) return -1;
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function isSleepOnTime(sleepTime: string): boolean {
  const min = timeToMinutes(sleepTime);
  if (min < 0) return false;
  return min >= SLEEP_WINDOW_START || min <= SLEEP_WINDOW_END;
}

export function getSleepTimeStatus(sleepTime: string): "good" | "bad" | "empty" {
  if (!sleepTime) return "empty";
  return isSleepOnTime(sleepTime) ? "good" : "bad";
}

export function getDailyScore(log: DayLog): number {
  const completed = Object.values(log.habits).filter(Boolean).length;
  return Math.round((completed / 12) * 100);
}

export function getScoreLabel(score: number): string {
  if (score >= 90) return "Legendary";
  if (score >= 75) return "Solid";
  if (score >= 50) return "Building";
  return "Rough day";
}

export function getScoreColor(score: number): string {
  if (score >= 90) return "text-mint";
  if (score >= 75) return "text-green-500";
  if (score >= 50) return "text-amber";
  return "text-coral";
}

export function getCurrentStreak(
  dayLogs: Record<string, DayLog>,
  habitId: HabitId,
  upToDate: string
): number {
  let streak = 0;
  let date = parseISO(upToDate);

  while (true) {
    const key = format(date, "yyyy-MM-dd");
    const log = dayLogs[key];
    if (!log?.habits[habitId]) break;
    streak++;
    date = subDays(date, 1);
  }

  return streak;
}

export function getLongestStreak(
  dayLogs: Record<string, DayLog>,
  habitId: HabitId,
  upToDate: string
): number {
  const dates = Object.keys(dayLogs)
    .filter((d) => dayLogs[d]?.habits[habitId])
    .sort();

  if (dates.length === 0) return 0;

  let maxStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < dates.length; i++) {
    const prev = parseISO(dates[i - 1]);
    const curr = parseISO(dates[i]);
    if (differenceInDays(curr, prev) === 1) {
      currentStreak++;
    } else {
      maxStreak = Math.max(maxStreak, currentStreak);
      currentStreak = 1;
    }
  }

  return Math.max(maxStreak, currentStreak);
}

export function getLast7Days(dayLogs: Record<string, DayLog>, habitId: HabitId, upToDate: string): boolean[] {
  const result: boolean[] = [];
  let date = parseISO(upToDate);

  for (let i = 0; i < 7; i++) {
    const key = format(date, "yyyy-MM-dd");
    result.unshift(dayLogs[key]?.habits[habitId] ?? false);
    date = subDays(date, 1);
  }

  return result;
}

export function getSoberStats() {
  const start = parseISO("2026-02-18");
  const now = new Date();
  const days = differenceInDays(now, start);
  const hours = differenceInHours(now, start) % 24;
  return { days, hours };
}

export function getDaysTracked(dayLogs: Record<string, DayLog>): number {
  return Object.keys(dayLogs).length;
}

export function getSleepOnTimeLast7(dayLogs: Record<string, DayLog>): {
  onTime: number;
  total: number;
} {
  const today = new Date();
  let onTime = 0;
  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = format(subDays(today, i), "yyyy-MM-dd");
    const log = dayLogs[d];
    if (log?.sleepTime) {
      total++;
      if (isSleepOnTime(log.sleepTime)) onTime++;
    }
  }
  return { onTime, total };
}

export function getReadingStreak(books: Book[], upToDate: string): number {
  const allLogs = books.flatMap((b) => b.readingLog);
  const readDates = [...new Set(allLogs.map((l) => l.date))].sort().reverse();

  let streak = 0;
  let date = parseISO(upToDate);

  for (let i = 0; i < 365; i++) {
    const key = format(date, "yyyy-MM-dd");
    if (readDates.includes(key)) {
      streak++;
      date = subDays(date, 1);
    } else {
      break;
    }
  }

  return streak;
}

export function getWeeklySummary(
  dayLogs: Record<string, DayLog>,
  weekEndDate: string
) {
  const end = parseISO(weekEndDate);
  const start = startOfWeek(end, { weekStartsOn: 0 });
  const weekDates: string[] = [];
  let d = start;
  while (d <= end) {
    weekDates.push(format(d, "yyyy-MM-dd"));
    d = addDays(d, 1);
  }

  const logs = weekDates
    .map((date) => dayLogs[date])
    .filter((l): l is DayLog => !!l);

  if (logs.length === 0) {
    return {
      bestDay: null,
      worstDay: null,
      avgScore: 0,
      totalWorkouts: 0,
      sleepImprovement: null,
      sleepOnTimeCount: 0,
      sleepOnTimeTotal: 0,
      habitsImproving: [] as HabitId[],
      habitsDeclining: [] as HabitId[],
      message: "No data for this week yet.",
    };
  }

  const scores = logs.map((l) => ({ date: l.date, score: getDailyScore(l) }));
  const bestDay = scores.reduce((a, b) => (a.score >= b.score ? a : b));
  const worstDay = scores.reduce((a, b) => (a.score <= b.score ? a : b));
  const avgScore = Math.round(
    scores.reduce((s, x) => s + x.score, 0) / scores.length
  );
  const totalWorkouts = logs.filter((l) => l.habits.workout).length;

  const lastWeekStart = subDays(start, 7);
  const lastWeekEnd = subDays(end, 7);
  const lastWeekLogs = Object.entries(dayLogs)
    .filter(([date]) => {
      const d = parseISO(date);
      return isWithinInterval(d, { start: lastWeekStart, end: lastWeekEnd });
    })
    .map(([, log]) => log);

  const logsWithSleep = logs.filter((l) => l.sleepTime);
  const thisWeekAvgSleep = logsWithSleep.map((l) => timeToMinutes(l.sleepTime));
  const lastWeekLogsWithSleep = lastWeekLogs.filter((l) => l.sleepTime);
  const lastWeekAvgSleep = lastWeekLogsWithSleep.map((l) =>
    timeToMinutes(l.sleepTime)
  );

  const sleepOnTimeCount = logsWithSleep.filter((l) =>
    isSleepOnTime(l.sleepTime)
  ).length;
  const sleepOnTimeTotal = logsWithSleep.length;

  let sleepImprovement: number | null = null;
  if (thisWeekAvgSleep.length && lastWeekAvgSleep.length) {
    const thisAvg = thisWeekAvgSleep.reduce((a, b) => a + b, 0) / thisWeekAvgSleep.length;
    const lastAvg = lastWeekAvgSleep.reduce((a, b) => a + b, 0) / lastWeekAvgSleep.length;
    sleepImprovement = lastAvg - thisAvg;
  }

  const habitRatesThisWeek: Record<HabitId, number> = {} as Record<HabitId, number>;
  const habitRatesLastWeek: Record<HabitId, number> = {} as Record<HabitId, number>;
  const habitIds = [
    "fajr",
    "quran",
    "sunlight",
    "chess",
    "breakfast",
    "workout",
    "deepwork",
    "no_nap",
    "coffee_cutoff",
    "isha",
    "bedtime",
    "daughter",
  ] as HabitId[];

  for (const id of habitIds) {
    habitRatesThisWeek[id] =
      logs.filter((l) => l.habits[id]).length / Math.max(logs.length, 1);
    habitRatesLastWeek[id] =
      lastWeekLogs.filter((l) => l.habits[id]).length /
      Math.max(lastWeekLogs.length, 1);
  }

  const habitsImproving = habitIds.filter(
    (id) => habitRatesThisWeek[id] > habitRatesLastWeek[id]
  );
  const habitsDeclining = habitIds.filter(
    (id) => habitRatesThisWeek[id] < habitRatesLastWeek[id]
  );

  let message = "";
  if (avgScore >= 90) message = "Legendary week. You're building something real.";
  else if (avgScore >= 75) message = "Solid week. Keep the momentum.";
  else if (avgScore >= 50) message = "Building. Every day is a chance to level up.";
  else message = "Rough week. Tomorrow is a new day. You've got this.";

  return {
    bestDay,
    worstDay,
    avgScore,
    totalWorkouts,
    sleepImprovement,
    sleepOnTimeCount,
    sleepOnTimeTotal,
    habitsImproving,
    habitsDeclining,
    message,
  };
}
