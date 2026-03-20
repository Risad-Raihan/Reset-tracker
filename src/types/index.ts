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

// Deep Work Timer
export interface DeepWorkSession {
  id: string;
  startTime: string;
  endTime: string;
  durationMs: number;
}

export interface DeepWorkDay {
  date: string;
  totalMs: number;
  sessions: DeepWorkSession[];
}

// Notes
export interface Note {
  id: string;
  date: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  pinned: boolean;
}

export interface DayColorConfig {
  bg: string;
  border: string;
  accent: string;
}

const DAY_COLORS: DayColorConfig[] = [
  { bg: "#0d3d2a", border: "#3DFFA0", accent: "text-mint" },
  { bg: "#0d1f3c", border: "#5B9DFF", accent: "text-blue" },
  { bg: "#1e1233", border: "#A78BFA", accent: "text-purple" },
  { bg: "#2d1f06", border: "#FFB84D", accent: "text-amber" },
  { bg: "#2d0f0d", border: "#FF6B5E", accent: "text-coral" },
  { bg: "#1a1a0d", border: "#d4d44d", accent: "text-yellow-400" },
  { bg: "#0d2d2d", border: "#4dfff0", accent: "text-teal-400" },
  { bg: "#2d1a0d", border: "#ff8c4d", accent: "text-orange-400" },
];

export function getDayColor(date: string): DayColorConfig {
  const hash = date.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return DAY_COLORS[hash % DAY_COLORS.length];
}
