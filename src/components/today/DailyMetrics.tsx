"use client";

import { useApp } from "@/lib/store";
import { getSleepTimeStatus } from "@/lib/calculations";
import type { DayLog } from "@/types";
import { motion } from "framer-motion";

interface DailyMetricsProps {
  date: string;
  log: DayLog;
}

export function DailyMetrics({ date, log }: DailyMetricsProps) {
  const { setDayLog } = useApp();

  const update = (updates: Partial<DayLog>) => {
    setDayLog(date, updates);
  };

  const l = log;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="space-y-6 rounded-xl border border-white/10 bg-surface p-6"
    >
      <h3 className="font-display text-lg font-bold text-white">
        Daily Metrics
      </h3>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm text-white/60">
            Sleep time <span className="text-white/40">(goal: 11 PM – 5 AM)</span>
          </label>
          <input
            type="time"
            value={l.sleepTime}
            onChange={(e) => update({ sleepTime: e.target.value })}
            className={`w-full rounded-lg border px-4 py-2 font-mono text-white focus:outline-none ${
              getSleepTimeStatus(l.sleepTime) === "bad"
                ? "border-coral bg-coral/10 ring-1 ring-coral/50"
                : getSleepTimeStatus(l.sleepTime) === "good"
                  ? "border-mint/50 bg-surface-elevated focus:border-mint"
                  : "border-white/10 bg-surface-elevated focus:border-mint/50"
            }`}
          />
          {getSleepTimeStatus(l.sleepTime) === "bad" && (
            <p className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-coral">
              <span>⚠</span> Extremely bad — outside 11 PM–5 AM window
            </p>
          )}
        </div>
        <div>
          <label className="mb-2 block text-sm text-white/60">
            Wake time
          </label>
          <input
            type="time"
            value={l.wakeTime}
            onChange={(e) => update({ wakeTime: e.target.value })}
            className="w-full rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-mono text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">
          Energy level (1–5)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update({ energy: n })}
              className={`h-10 w-10 rounded-lg font-mono text-sm transition-all ${
                l.energy === n
                  ? "bg-mint/20 text-mint ring-1 ring-mint/50"
                  : "bg-surface-elevated text-white/50 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">
          Mood (1–5)
        </label>
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => update({ mood: n })}
              className={`h-10 w-10 rounded-lg font-mono text-sm transition-all ${
                l.mood === n
                  ? "bg-purple/20 text-purple ring-1 ring-purple/50"
                  : "bg-surface-elevated text-white/50 hover:bg-white/10"
              }`}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">
          Cups of coffee
        </label>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => update({ coffee: Math.max(0, l.coffee - 1) })}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-white hover:bg-white/10"
          >
            −
          </button>
          <span className="font-mono text-xl text-white">{l.coffee}</span>
          <button
            type="button"
            onClick={() => update({ coffee: l.coffee + 1 })}
            className="flex h-10 w-10 items-center justify-center rounded-lg bg-surface-elevated text-white hover:bg-white/10"
          >
            +
          </button>
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">
          Quick note
        </label>
        <textarea
          value={l.note}
          onChange={(e) => update({ note: e.target.value })}
          placeholder="Optional journal entry..."
          rows={3}
          className="w-full resize-none rounded-lg border border-white/10 bg-surface-elevated px-4 py-3 text-white placeholder:text-white/40 focus:border-mint/50 focus:outline-none"
        />
      </div>
    </motion.div>
  );
}
