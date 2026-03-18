"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from "react";
import { useStorage } from "./useStorage";
import type {
  DayLog,
  TaskDay,
  Task,
  Book,
  HabitId,
  TaskPriority,
} from "@/types";
import { HABIT_IDS } from "@/types";
import { format } from "date-fns";

const defaultHabits = Object.fromEntries(
  HABIT_IDS.map((id) => [id, false])
) as Record<HabitId, boolean>;

function createEmptyDayLog(date: string): DayLog {
  return {
    date,
    habits: { ...defaultHabits },
    sleepTime: "",
    wakeTime: "",
    energy: 0,
    mood: 0,
    coffee: 0,
    note: "",
  };
}

function createEmptyTask(id: string): Task {
  return { id, text: "", priority: "important", done: false };
}

function createEmptyTaskDay(date: string): TaskDay {
  return {
    date,
    tasks: [
      createEmptyTask(crypto.randomUUID()),
      createEmptyTask(crypto.randomUUID()),
      createEmptyTask(crypto.randomUUID()),
    ],
  };
}

interface AppContextValue {
  dayLogs: Record<string, DayLog>;
  taskDays: Record<string, TaskDay>;
  books: Book[];
  isHydrated: boolean;
  getDayLog: (date: string) => DayLog;
  setDayLog: (date: string, log: Partial<DayLog> | DayLog) => void;
  setHabit: (date: string, habitId: HabitId, value: boolean) => void;
  getTaskDay: (date: string) => TaskDay;
  setTaskDay: (date: string, tasks: Task[]) => void;
  setTask: (date: string, index: number, task: Partial<Task>) => void;
  addBook: (book: Omit<Book, "id" | "readingLog" | "status">, pagesToday?: number) => void;
  updateBook: (id: string, updates: Partial<Book>) => void;
  completeBook: (id: string, rating?: number, review?: string) => void;
  deleteBook: (id: string) => void;
  logReading: (bookId: string, date: string, pages: number) => void;
  celebratedMilestones: Record<string, number[]>;
  markMilestoneCelebrated: (habitId: string, days: number) => void;
  exportData: () => string;
  importData: (json: string) => void;
  clearData: () => void;
}

const MILESTONE_STORAGE_KEY = "reset-celebrated-milestones";
const STORAGE_KEYS = {
  dayLogs: "reset-day-logs",
  taskDays: "reset-task-days",
  books: "reset-books",
  milestones: MILESTONE_STORAGE_KEY,
} as const;

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [dayLogs, setDayLogs, dayLogsHydrated] = useStorage<
    Record<string, DayLog>
  >(STORAGE_KEYS.dayLogs, {});

  const [taskDays, setTaskDays, taskDaysHydrated] = useStorage<
    Record<string, TaskDay>
  >(STORAGE_KEYS.taskDays, {});

  const [books, setBooks, booksHydrated] = useStorage<Book[]>(STORAGE_KEYS.books, []);

  const [celebratedMilestones, setCelebratedMilestones, milestonesHydrated] =
    useStorage<Record<string, number[]>>(STORAGE_KEYS.milestones, {});

  const isHydrated =
    dayLogsHydrated && taskDaysHydrated && booksHydrated && milestonesHydrated;

  const markMilestoneCelebrated = useCallback(
    (habitId: string, days: number) => {
      setCelebratedMilestones((prev) => {
        const arr = prev[habitId] ?? [];
        if (arr.includes(days)) return prev;
        return {
          ...prev,
          [habitId]: [...arr, days].sort((a, b) => a - b),
        };
      });
    },
    [setCelebratedMilestones]
  );

  const exportData = useCallback(() => {
    const data = {
      dayLogs,
      taskDays,
      books,
      celebratedMilestones,
      exportedAt: new Date().toISOString(),
    };
    return JSON.stringify(data, null, 2);
  }, [dayLogs, taskDays, books, celebratedMilestones]);

  const importData = useCallback(
    (json: string) => {
      try {
        const data = JSON.parse(json);
        if (data.dayLogs) setDayLogs(data.dayLogs);
        if (data.taskDays) setTaskDays(data.taskDays);
        if (data.books) setBooks(data.books);
        if (data.celebratedMilestones) setCelebratedMilestones(data.celebratedMilestones);
        if (typeof window !== "undefined") window.location.reload();
      } catch (e) {
        console.error("Import failed:", e);
        throw new Error("Invalid backup file");
      }
    },
    [setDayLogs, setTaskDays, setBooks, setCelebratedMilestones]
  );

  const clearData = useCallback(() => {
    setDayLogs({});
    setTaskDays({});
    setBooks([]);
    setCelebratedMilestones({});
    if (typeof window !== "undefined") window.location.reload();
  }, [setDayLogs, setTaskDays, setBooks, setCelebratedMilestones]);

  const getDayLog = useCallback(
    (date: string): DayLog => {
      return dayLogs[date] ?? createEmptyDayLog(date);
    },
    [dayLogs]
  );

  const setDayLog = useCallback(
    (date: string, log: Partial<DayLog> | DayLog) => {
      setDayLogs((prev) => {
        const existing = prev[date] ?? createEmptyDayLog(date);
        const merged = { ...existing, ...log, date };
        return { ...prev, [date]: merged };
      });
    },
    [setDayLogs]
  );

  const setHabit = useCallback(
    (date: string, habitId: HabitId, value: boolean) => {
      setDayLogs((prev) => {
        const existing = prev[date] ?? createEmptyDayLog(date);
        return {
          ...prev,
          [date]: {
            ...existing,
            habits: { ...existing.habits, [habitId]: value },
          },
        };
      });
    },
    [setDayLogs]
  );

  const getTaskDay = useCallback(
    (date: string): TaskDay => {
      const td = taskDays[date] ?? createEmptyTaskDay(date);
      const tasks = [...td.tasks];
      while (tasks.length < 3) {
        tasks.push(createEmptyTask(crypto.randomUUID()));
      }
      return { date, tasks: tasks.slice(0, 3) };
    },
    [taskDays]
  );

  const setTaskDay = useCallback(
    (date: string, tasks: Task[]) => {
      setTaskDays((prev) => ({ ...prev, [date]: { date, tasks } }));
    },
    [setTaskDays]
  );

  const setTask = useCallback(
    (date: string, index: number, task: Partial<Task>) => {
      const td = taskDays[date] ?? createEmptyTaskDay(date);
      const tasks = [...td.tasks];
      if (tasks[index]) {
        tasks[index] = { ...tasks[index], ...task };
        setTaskDays((prev) => ({ ...prev, [date]: { date, tasks } }));
      }
    },
    [taskDays, setTaskDays]
  );

  const addBook = useCallback(
    (book: Omit<Book, "id" | "readingLog" | "status">, pagesToday?: number) => {
      const newBook: Book = {
        ...book,
        id: crypto.randomUUID(),
        readingLog: [],
        status: "reading",
      };
      if (pagesToday && pagesToday > 0) {
        const today = format(new Date(), "yyyy-MM-dd");
        newBook.readingLog = [{ date: today, pages: pagesToday }];
        newBook.currentPage = (newBook.currentPage ?? 0) + pagesToday;
      }
      setBooks((prev) => [...prev, newBook]);
    },
    [setBooks]
  );

  const updateBook = useCallback(
    (id: string, updates: Partial<Book>) => {
      setBooks((prev) =>
        prev.map((b) => (b.id === id ? { ...b, ...updates } : b))
      );
    },
    [setBooks]
  );

  const completeBook = useCallback(
    (id: string, rating?: number, review?: string) => {
      setBooks((prev) =>
        prev.map((b) =>
          b.id === id
            ? {
                ...b,
                status: "completed" as const,
                finishDate: format(new Date(), "yyyy-MM-dd"),
                rating,
                review,
              }
            : b
        )
      );
    },
    [setBooks]
  );

  const deleteBook = useCallback(
    (id: string) => {
      setBooks((prev) => prev.filter((b) => b.id !== id));
    },
    [setBooks]
  );

  const logReading = useCallback(
    (bookId: string, date: string, pages: number) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== bookId) return b;
          const existing = b.readingLog.find((l) => l.date === date);
          const newLog = existing
            ? b.readingLog.map((l) =>
                l.date === date ? { ...l, pages: l.pages + pages } : l
              )
            : [...b.readingLog, { date, pages }];
          return {
            ...b,
            readingLog: newLog,
            currentPage: (b.currentPage ?? 0) + pages,
          };
        })
      );
    },
    [setBooks]
  );

  const value = useMemo<AppContextValue>(
    () => ({
      dayLogs,
      taskDays,
      books,
      isHydrated,
      getDayLog,
      setDayLog,
      setHabit,
      getTaskDay,
      setTaskDay,
      setTask,
      addBook,
      updateBook,
      completeBook,
      deleteBook,
      logReading,
      celebratedMilestones,
      markMilestoneCelebrated,
      exportData,
      importData,
      clearData,
    }),
    [
      dayLogs,
      taskDays,
      books,
      isHydrated,
      getDayLog,
      setDayLog,
      setHabit,
      getTaskDay,
      setTaskDay,
      setTask,
      addBook,
      updateBook,
      completeBook,
      deleteBook,
      logReading,
      celebratedMilestones,
      markMilestoneCelebrated,
      exportData,
      importData,
      clearData,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
