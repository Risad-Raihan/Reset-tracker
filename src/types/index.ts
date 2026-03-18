export const HABIT_IDS = [
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
] as const;

export type HabitId = (typeof HABIT_IDS)[number];

export const HABIT_LABELS: Record<HabitId, string> = {
  fajr: "Fajr on time 🌙",
  quran: "Quran session 📖",
  sunlight: "Morning sunlight ☀️",
  chess: "Chess practice ♟",
  breakfast: "Ate breakfast 🍳",
  workout: "Swim / workout 🏊",
  deepwork: "Deep work completed ⚡",
  no_nap: "No daytime nap 💪",
  coffee_cutoff: "Coffee cutoff by 3 PM ☕",
  isha: "Isha on time 🌙",
  bedtime: "In bed by target time 🛏",
  daughter: "Daughter time 👶",
};

export interface DayLog {
  date: string;
  habits: Record<HabitId, boolean>;
  sleepTime: string;
  wakeTime: string;
  energy: number;
  mood: number;
  coffee: number;
  note: string;
}

export type TaskPriority = "critical" | "important" | "nice";

export interface Task {
  id: string;
  text: string;
  priority: TaskPriority;
  done: boolean;
  carriedOver?: boolean;
}

export interface TaskDay {
  date: string;
  tasks: Task[];
}

export interface Book {
  id: string;
  title: string;
  author: string;
  startDate: string;
  finishDate?: string;
  currentPage?: number;
  totalPages?: number;
  rating?: number;
  review?: string;
  status: "reading" | "completed";
  readingLog: { date: string; pages: number }[];
}

export interface AppData {
  dayLogs: Record<string, DayLog>;
  taskDays: Record<string, TaskDay>;
  books: Book[];
}

export const SOBER_START_DATE = "2026-02-18";

export const STREAK_MILESTONES = [7, 14, 21, 30, 60, 90] as const;
