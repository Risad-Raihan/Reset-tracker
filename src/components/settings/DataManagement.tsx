"use client";

import { useState, useRef } from "react";
import { useApp } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Modal } from "@/components/ui/Modal";

const LS_KEYS = {
  dayLogs: "reset-day-logs",
  taskDays: "reset-task-days",
  books: "reset-books",
  milestones: "reset-celebrated-milestones",
  deepwork: "reset-deepwork",
  notes: "reset-notes",
} as const;

export function DataManagement() {
  const { exportData, importData, clearData } = useApp();
  const [showClearModal, setShowClearModal] = useState(false);
  const [importError, setImportError] = useState<string | null>(null);
  const [migrating, setMigrating] = useState(false);
  const [migrateStatus, setMigrateStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const json = exportData();
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `reset-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => {
    setImportError(null);
    fileInputRef.current?.click();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const json = reader.result as string;
        importData(json);
      } catch (err) {
        setImportError(err instanceof Error ? err.message : "Import failed");
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleClear = async () => {
    await clearData();
    setShowClearModal(false);
  };

  const handleMigrate = async () => {
    if (typeof window === "undefined") return;
    setMigrating(true);
    setMigrateStatus(null);
    try {
      const raw = {
        dayLogs: window.localStorage.getItem(LS_KEYS.dayLogs),
        taskDays: window.localStorage.getItem(LS_KEYS.taskDays),
        books: window.localStorage.getItem(LS_KEYS.books),
        milestones: window.localStorage.getItem(LS_KEYS.milestones),
        deepwork: window.localStorage.getItem(LS_KEYS.deepwork),
        notes: window.localStorage.getItem(LS_KEYS.notes),
      };

      if (raw.dayLogs) {
        const data = JSON.parse(raw.dayLogs) as Record<string, Record<string, unknown>>;
        const rows = Object.values(data).map((log) => ({
          date: log.date,
          habits: log.habits,
          sleep_time: log.sleepTime ?? "",
          wake_time: log.wakeTime ?? "",
          energy: log.energy ?? 0,
          mood: log.mood ?? 0,
          coffee: log.coffee ?? 0,
          note: log.note ?? "",
        }));
        if (rows.length) await supabase.from("day_logs").upsert(rows);
      }

      if (raw.taskDays) {
        const data = JSON.parse(raw.taskDays) as Record<string, { date: string; tasks: unknown[] }>;
        const rows = Object.values(data).map((td) => ({ date: td.date, tasks: td.tasks }));
        if (rows.length) await supabase.from("task_days").upsert(rows);
      }

      if (raw.books) {
        const data = JSON.parse(raw.books) as Array<Record<string, unknown>>;
        const rows = data.map((b) => ({
          id: b.id,
          title: b.title,
          author: b.author,
          start_date: b.startDate,
          finish_date: b.finishDate ?? null,
          current_page: b.currentPage ?? null,
          total_pages: b.totalPages ?? null,
          rating: b.rating ?? null,
          review: b.review ?? null,
          status: b.status,
          reading_log: b.readingLog ?? [],
        }));
        if (rows.length) await supabase.from("books").upsert(rows);
      }

      if (raw.milestones) {
        const data = JSON.parse(raw.milestones) as Record<string, number[]>;
        const rows = Object.entries(data).map(([habit_id, milestones]) => ({ habit_id, milestones }));
        if (rows.length) await supabase.from("celebrated_milestones").upsert(rows);
      }

      if (raw.deepwork) {
        const data = JSON.parse(raw.deepwork) as Record<string, { date: string; totalMs: number; sessions: unknown[] }>;
        const rows = Object.values(data).map((d) => ({
          date: d.date,
          total_ms: d.totalMs,
          sessions: d.sessions,
        }));
        if (rows.length) await supabase.from("deep_work_days").upsert(rows);
      }

      if (raw.notes) {
        const data = JSON.parse(raw.notes) as Array<Record<string, unknown>>;
        const rows = data.map((n) => ({
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

      if (!raw.dayLogs && !raw.taskDays && !raw.books && !raw.milestones && !raw.deepwork && !raw.notes) {
        setMigrateStatus("No local data found to migrate.");
        return;
      }
      setMigrateStatus("Migration complete! Your data is now synced to Supabase.");
    } catch (e) {
      setMigrateStatus(`Migration failed: ${e instanceof Error ? e.message : "Unknown error"}`);
    } finally {
      setMigrating(false);
    }
  };

  return (
    <div className="space-y-2 border-t border-white/10 pt-4">
      <p className="text-xs font-medium text-white/50">Data</p>
      <div className="flex flex-col gap-1">
        <button
          type="button"
          onClick={handleMigrate}
          disabled={migrating}
          className="rounded-lg px-3 py-2 text-left text-sm text-mint transition-colors hover:bg-mint/10 disabled:opacity-50"
        >
          {migrating ? "Migrating…" : "Migrate from this device"}
        </button>
        {migrateStatus && (
          <p className={`px-3 text-xs ${migrateStatus.startsWith("Migration failed") ? "text-coral" : "text-mint"}`}>
            {migrateStatus}
          </p>
        )}
        <button
          type="button"
          onClick={handleExport}
          className="rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Export JSON
        </button>
        <button
          type="button"
          onClick={handleImportClick}
          className="rounded-lg px-3 py-2 text-left text-sm text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          Import JSON
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={handleImportFile}
        />
        <button
          type="button"
          onClick={() => setShowClearModal(true)}
          className="rounded-lg px-3 py-2 text-left text-sm text-coral transition-colors hover:bg-coral/10"
        >
          Clear all data
        </button>
      </div>
      {importError && (
        <p className="text-xs text-coral">{importError}</p>
      )}

      <Modal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        title="Clear all data?"
      >
        <p className="mb-4 text-white/80">
          This will permanently delete all your habits, tasks, books, and
          progress. Export a backup first if you want to restore later.
        </p>
        <div className="flex gap-2">
          <button
            onClick={handleClear}
            className="rounded-lg bg-coral/20 px-4 py-2 font-medium text-coral transition-colors hover:bg-coral/30"
          >
            Yes, clear everything
          </button>
          <button
            onClick={() => setShowClearModal(false)}
            className="rounded-lg border border-white/10 px-4 py-2 text-white/70 transition-colors hover:bg-white/5"
          >
            Cancel
          </button>
        </div>
      </Modal>
    </div>
  );
}
