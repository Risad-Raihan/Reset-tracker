"use client";

import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { supabase } from "./supabase";
import type {
  DayLog,
  TaskDay,
  Task,
  Book,
  HabitId,
  DeepWorkSession,
  DeepWorkDay,
  Note,
} from "@/types";
import { HABIT_IDS } from "@/types";
import { format } from "date-fns";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

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

// DB row ↔ App type converters
function fromDbDayLog(row: Record<string, unknown>): DayLog {
  return {
    date: row.date as string,
    habits: (row.habits ?? {}) as Record<HabitId, boolean>,
    sleepTime: (row.sleep_time as string) ?? "",
    wakeTime: (row.wake_time as string) ?? "",
    energy: (row.energy as number) ?? 0,
    mood: (row.mood as number) ?? 0,
    coffee: (row.coffee as number) ?? 0,
    note: (row.note as string) ?? "",
  };
}

function toDbDayLog(log: DayLog) {
  return {
    date: log.date,
    habits: log.habits,
    sleep_time: log.sleepTime,
    wake_time: log.wakeTime,
    energy: log.energy,
    mood: log.mood,
    coffee: log.coffee,
    note: log.note,
  };
}

function fromDbBook(row: Record<string, unknown>): Book {
  return {
    id: row.id as string,
    title: row.title as string,
    author: row.author as string,
    startDate: row.start_date as string,
    finishDate: row.finish_date as string | undefined,
    currentPage: row.current_page as number | undefined,
    totalPages: row.total_pages as number | undefined,
    rating: row.rating as number | undefined,
    review: row.review as string | undefined,
    status: row.status as "reading" | "completed",
    readingLog: (row.reading_log ?? []) as { date: string; pages: number }[],
  };
}

function toDbBook(book: Book) {
  return {
    id: book.id,
    title: book.title,
    author: book.author,
    start_date: book.startDate,
    finish_date: book.finishDate ?? null,
    current_page: book.currentPage ?? null,
    total_pages: book.totalPages ?? null,
    rating: book.rating ?? null,
    review: book.review ?? null,
    status: book.status,
    reading_log: book.readingLog,
  };
}

// ---------------------------------------------------------------------------
// Context type
// ---------------------------------------------------------------------------

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
  importData: (json: string) => Promise<void>;
  clearData: () => Promise<void>;
  deepWorkDays: Record<string, DeepWorkDay>;
  addDeepWorkSession: (date: string, session: DeepWorkSession) => void;
  notes: Note[];
  addNote: (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function AppProvider({ children }: { children: ReactNode }) {
  const [dayLogs, setDayLogs] = useState<Record<string, DayLog>>({});
  const [taskDays, setTaskDays] = useState<Record<string, TaskDay>>({});
  const [books, setBooks] = useState<Book[]>([]);
  const [celebratedMilestones, setCelebratedMilestones] = useState<Record<string, number[]>>({});
  const [deepWorkDays, setDeepWorkDays] = useState<Record<string, DeepWorkDay>>({});
  const [notes, setNotes] = useState<Note[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // ── Initial load from Supabase ───────────────────────────────────────────
  useEffect(() => {
    async function loadAll() {
      const [dlRes, tdRes, bRes, mRes, dwRes, nRes] = await Promise.all([
        supabase.from("day_logs").select("*"),
        supabase.from("task_days").select("*"),
        supabase.from("books").select("*"),
        supabase.from("celebrated_milestones").select("*"),
        supabase.from("deep_work_days").select("*"),
        supabase.from("notes").select("*"),
      ]);

      if (dlRes.data) {
        const map: Record<string, DayLog> = {};
        for (const row of dlRes.data) map[row.date] = fromDbDayLog(row);
        setDayLogs(map);
      }

      if (tdRes.data) {
        const map: Record<string, TaskDay> = {};
        for (const row of tdRes.data) map[row.date] = { date: row.date, tasks: row.tasks };
        setTaskDays(map);
      }

      if (bRes.data) {
        setBooks(bRes.data.map((r) => fromDbBook(r)));
      }

      if (mRes.data) {
        const map: Record<string, number[]> = {};
        for (const row of mRes.data) map[row.habit_id] = row.milestones ?? [];
        setCelebratedMilestones(map);
      }

      if (dwRes.data) {
        const map: Record<string, DeepWorkDay> = {};
        for (const row of dwRes.data) {
          map[row.date] = { date: row.date, totalMs: row.total_ms, sessions: row.sessions };
        }
        setDeepWorkDays(map);
      }

      if (nRes.data) {
        setNotes(
          nRes.data.map((r) => ({
            id: r.id,
            date: r.date,
            title: r.title,
            content: r.content,
            createdAt: r.created_at,
            updatedAt: r.updated_at,
            pinned: r.pinned,
          }))
        );
      }

      setIsHydrated(true);
    }

    loadAll();
  }, []);

  // ── Milestones ────────────────────────────────────────────────────────────
  const markMilestoneCelebrated = useCallback(
    (habitId: string, days: number) => {
      setCelebratedMilestones((prev) => {
        const arr = prev[habitId] ?? [];
        if (arr.includes(days)) return prev;
        const next = { ...prev, [habitId]: [...arr, days].sort((a, b) => a - b) };
        void supabase.from("celebrated_milestones").upsert({
          habit_id: habitId,
          milestones: next[habitId],
        });
        return next;
      });
    },
    []
  );

  // ── Export / Import / Clear ───────────────────────────────────────────────
  const exportData = useCallback(() => {
    return JSON.stringify(
      { dayLogs, taskDays, books, celebratedMilestones, deepWorkDays, notes, exportedAt: new Date().toISOString() },
      null,
      2
    );
  }, [dayLogs, taskDays, books, celebratedMilestones, deepWorkDays, notes]);

  const importData = useCallback(async (json: string) => {
    const data = JSON.parse(json);

    if (data.dayLogs) {
      setDayLogs(data.dayLogs);
      const rows = Object.values(data.dayLogs as Record<string, DayLog>).map(toDbDayLog);
      if (rows.length) await supabase.from("day_logs").upsert(rows);
    }
    if (data.taskDays) {
      setTaskDays(data.taskDays);
      const rows = Object.values(data.taskDays as Record<string, TaskDay>).map((td) => ({
        date: td.date,
        tasks: td.tasks,
      }));
      if (rows.length) await supabase.from("task_days").upsert(rows);
    }
    if (data.books) {
      setBooks(data.books);
      const rows = (data.books as Book[]).map(toDbBook);
      if (rows.length) await supabase.from("books").upsert(rows);
    }
    if (data.celebratedMilestones) {
      setCelebratedMilestones(data.celebratedMilestones);
      const rows = Object.entries(data.celebratedMilestones as Record<string, number[]>).map(
        ([habit_id, milestones]) => ({ habit_id, milestones })
      );
      if (rows.length) await supabase.from("celebrated_milestones").upsert(rows);
    }
    if (data.deepWorkDays) {
      setDeepWorkDays(data.deepWorkDays);
      const rows = Object.values(data.deepWorkDays as Record<string, DeepWorkDay>).map((d) => ({
        date: d.date,
        total_ms: d.totalMs,
        sessions: d.sessions,
      }));
      if (rows.length) await supabase.from("deep_work_days").upsert(rows);
    }
    if (data.notes) {
      setNotes(data.notes);
      const rows = (data.notes as Note[]).map((n) => ({
        id: n.id,
        date: n.date,
        title: n.title,
        content: n.content,
        created_at: n.createdAt,
        updated_at: n.updatedAt,
        pinned: n.pinned,
      }));
      if (rows.length) await supabase.from("notes").upsert(rows);
    }
  }, []);

  const clearData = useCallback(async () => {
    await Promise.all([
      supabase.from("day_logs").delete().neq("date", "__never__"),
      supabase.from("task_days").delete().neq("date", "__never__"),
      supabase.from("books").delete().neq("id", "__never__"),
      supabase.from("celebrated_milestones").delete().neq("habit_id", "__never__"),
      supabase.from("deep_work_days").delete().neq("date", "__never__"),
      supabase.from("notes").delete().neq("id", "__never__"),
    ]);
    setDayLogs({});
    setTaskDays({});
    setBooks([]);
    setCelebratedMilestones({});
    setDeepWorkDays({});
    setNotes([]);
  }, []);

  // ── Deep work ─────────────────────────────────────────────────────────────
  const addDeepWorkSession = useCallback(
    (date: string, session: DeepWorkSession) => {
      setDeepWorkDays((prev) => {
        const existing = prev[date] ?? { date, totalMs: 0, sessions: [] };
        const next = {
          date,
          totalMs: existing.totalMs + session.durationMs,
          sessions: [...existing.sessions, session],
        };
        void supabase.from("deep_work_days").upsert({
          date: next.date,
          total_ms: next.totalMs,
          sessions: next.sessions,
        });
        return { ...prev, [date]: next };
      });
    },
    []
  );

  // ── Notes ─────────────────────────────────────────────────────────────────
  const addNote = useCallback(
    (note: Omit<Note, "id" | "createdAt" | "updatedAt">) => {
      const now = new Date().toISOString();
      const newNote: Note = { ...note, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
      setNotes((prev) => [...prev, newNote]);
      void supabase.from("notes").insert({
        id: newNote.id,
        date: newNote.date,
        title: newNote.title,
        content: newNote.content,
        created_at: newNote.createdAt,
        updated_at: newNote.updatedAt,
        pinned: newNote.pinned,
      });
    },
    []
  );

  const updateNote = useCallback((id: string, updates: Partial<Note>) => {
    const now = new Date().toISOString();
    setNotes((prev) =>
      prev.map((n) => {
        if (n.id !== id) return n;
        const updated = { ...n, ...updates, updatedAt: now };
        void supabase.from("notes").update({
          date: updated.date,
          title: updated.title,
          content: updated.content,
          updated_at: updated.updatedAt,
          pinned: updated.pinned,
        }).eq("id", id);
        return updated;
      })
    );
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    void supabase.from("notes").delete().eq("id", id);
  }, []);

  // ── Day logs ──────────────────────────────────────────────────────────────
  const getDayLog = useCallback(
    (date: string): DayLog => dayLogs[date] ?? createEmptyDayLog(date),
    [dayLogs]
  );

  const setDayLog = useCallback(
    (date: string, log: Partial<DayLog> | DayLog) => {
      setDayLogs((prev) => {
        const merged = { ...(prev[date] ?? createEmptyDayLog(date)), ...log, date };
        void supabase.from("day_logs").upsert(toDbDayLog(merged));
        return { ...prev, [date]: merged };
      });
    },
    []
  );

  const setHabit = useCallback(
    (date: string, habitId: HabitId, value: boolean) => {
      setDayLogs((prev) => {
        const existing = prev[date] ?? createEmptyDayLog(date);
        const merged = { ...existing, habits: { ...existing.habits, [habitId]: value } };
        void supabase.from("day_logs").upsert(toDbDayLog(merged));
        return { ...prev, [date]: merged };
      });
    },
    []
  );

  // ── Task days ─────────────────────────────────────────────────────────────
  const getTaskDay = useCallback(
    (date: string): TaskDay => {
      const td = taskDays[date] ?? createEmptyTaskDay(date);
      const tasks = [...td.tasks];
      while (tasks.length < 3) tasks.push(createEmptyTask(crypto.randomUUID()));
      return { date, tasks: tasks.slice(0, 3) };
    },
    [taskDays]
  );

  const setTaskDay = useCallback(
    (date: string, tasks: Task[]) => {
      setTaskDays((prev) => {
        void supabase.from("task_days").upsert({ date, tasks });
        return { ...prev, [date]: { date, tasks } };
      });
    },
    []
  );

  const setTask = useCallback(
    (date: string, index: number, task: Partial<Task>) => {
      setTaskDays((prev) => {
        const td = prev[date] ?? createEmptyTaskDay(date);
        const tasks = [...td.tasks];
        if (!tasks[index]) return prev;
        tasks[index] = { ...tasks[index], ...task };
        const next = { date, tasks };
        void supabase.from("task_days").upsert({ date, tasks });
        return { ...prev, [date]: next };
      });
    },
    []
  );

  // ── Books ─────────────────────────────────────────────────────────────────
  const addBook = useCallback(
    (book: Omit<Book, "id" | "readingLog" | "status">, pagesToday?: number) => {
      const newBook: Book = { ...book, id: crypto.randomUUID(), readingLog: [], status: "reading" };
      if (pagesToday && pagesToday > 0) {
        const today = format(new Date(), "yyyy-MM-dd");
        newBook.readingLog = [{ date: today, pages: pagesToday }];
        newBook.currentPage = (newBook.currentPage ?? 0) + pagesToday;
      }
      setBooks((prev) => [...prev, newBook]);
      void supabase.from("books").insert(toDbBook(newBook));
    },
    []
  );

  const updateBook = useCallback((id: string, updates: Partial<Book>) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const updated = { ...b, ...updates };
        void supabase.from("books").update(toDbBook(updated)).eq("id", id);
        return updated;
      })
    );
  }, []);

  const completeBook = useCallback(
    (id: string, rating?: number, review?: string) => {
      setBooks((prev) =>
        prev.map((b) => {
          if (b.id !== id) return b;
          const updated = {
            ...b,
            status: "completed" as const,
            finishDate: format(new Date(), "yyyy-MM-dd"),
            rating,
            review,
          };
          void supabase.from("books").update(toDbBook(updated)).eq("id", id);
          return updated;
        })
      );
    },
    []
  );

  const deleteBook = useCallback((id: string) => {
    setBooks((prev) => prev.filter((b) => b.id !== id));
    void supabase.from("books").delete().eq("id", id);
  }, []);

  const logReading = useCallback((bookId: string, date: string, pages: number) => {
    setBooks((prev) =>
      prev.map((b) => {
        if (b.id !== bookId) return b;
        const existing = b.readingLog.find((l) => l.date === date);
        const newLog = existing
          ? b.readingLog.map((l) => (l.date === date ? { ...l, pages: l.pages + pages } : l))
          : [...b.readingLog, { date, pages }];
        const updated = { ...b, readingLog: newLog, currentPage: (b.currentPage ?? 0) + pages };
        void supabase.from("books").update(toDbBook(updated)).eq("id", bookId);
        return updated;
      })
    );
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────
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
      deepWorkDays,
      addDeepWorkSession,
      notes,
      addNote,
      updateNote,
      deleteNote,
    }),
    [
      dayLogs, taskDays, books, isHydrated,
      getDayLog, setDayLog, setHabit,
      getTaskDay, setTaskDay, setTask,
      addBook, updateBook, completeBook, deleteBook, logReading,
      celebratedMilestones, markMilestoneCelebrated,
      exportData, importData, clearData,
      deepWorkDays, addDeepWorkSession,
      notes, addNote, updateNote, deleteNote,
    ]
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
