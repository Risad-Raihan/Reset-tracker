"use client";

import { format, endOfWeek, startOfWeek } from "date-fns";
import { useApp } from "@/lib/store";
import { getWeeklySummary } from "@/lib/calculations";
import { HABIT_LABELS, type HabitId } from "@/types";
import { motion } from "framer-motion";

export function WeeklySummary() {
  const { dayLogs } = useApp();
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const summary = getWeeklySummary(dayLogs, format(weekEnd, "yyyy-MM-dd"));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-xl border border-white/10 bg-surface p-6">
        <h2 className="mb-4 font-display text-lg font-bold text-white">
          This Week&apos;s Summary
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summary.bestDay && (
            <div>
              <p className="text-sm text-white/60">Best day</p>
              <p className="font-display text-xl font-bold text-mint">
                {format(new Date(summary.bestDay.date), "EEE")} — {summary.bestDay.score}%
              </p>
            </div>
          )}
          {summary.worstDay && summary.worstDay.date !== summary.bestDay?.date && (
            <div>
              <p className="text-sm text-white/60">Worst day</p>
              <p className="font-display text-xl font-bold text-coral">
                {format(new Date(summary.worstDay.date), "EEE")} — {summary.worstDay.score}%
              </p>
            </div>
          )}
          <div>
            <p className="text-sm text-white/60">Average score</p>
            <p className="font-display text-xl font-bold text-white">
              {summary.avgScore}%
            </p>
          </div>
          <div>
            <p className="text-sm text-white/60">Workouts</p>
            <p className="font-display text-xl font-bold text-white">
              {summary.totalWorkouts}
            </p>
          </div>
        </div>
        {(summary.sleepOnTimeTotal ?? 0) > 0 && (
          <div className="mt-4">
            <p className="text-sm text-white/60">Sleep on time (11 PM–5 AM)</p>
            <p
              className={`font-display text-xl font-bold ${
                summary.sleepOnTimeCount === summary.sleepOnTimeTotal
                  ? "text-mint"
                  : summary.sleepOnTimeCount === 0
                    ? "text-coral"
                    : "text-amber"
              }`}
            >
              {summary.sleepOnTimeCount}/{summary.sleepOnTimeTotal ?? 0} nights
            </p>
          </div>
        )}
        {summary.sleepImprovement != null && (
          <div className="mt-4">
            <p className="text-sm text-white/60">Sleep improvement</p>
            <p className="font-mono text-white">
              {summary.sleepImprovement > 0
                ? `Bedtime ~${Math.round(summary.sleepImprovement / 60)}h earlier vs last week`
                : summary.sleepImprovement < 0
                  ? `Bedtime ~${Math.round(-summary.sleepImprovement / 60)}h later vs last week`
                  : "Same as last week"}
            </p>
          </div>
        )}
      </div>

      {(summary.habitsImproving.length > 0 || summary.habitsDeclining.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.habitsImproving.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <h3 className="mb-2 font-display text-sm font-bold text-mint">
                Improving
              </h3>
              <ul className="space-y-1 text-sm text-white/80">
                {summary.habitsImproving.map((id) => (
                  <li key={id}>{HABIT_LABELS[id as HabitId]}</li>
                ))}
              </ul>
            </div>
          )}
          {summary.habitsDeclining.length > 0 && (
            <div className="rounded-xl border border-white/10 bg-surface p-6">
              <h3 className="mb-2 font-display text-sm font-bold text-coral">
                Needs attention
              </h3>
              <ul className="space-y-1 text-sm text-white/80">
                {summary.habitsDeclining.map((id) => (
                  <li key={id}>{HABIT_LABELS[id as HabitId]}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <div className="rounded-xl border border-mint/20 bg-mint/5 p-6">
        <p className="font-display text-lg font-semibold text-mint">
          {summary.message}
        </p>
      </div>
    </motion.div>
  );
}
