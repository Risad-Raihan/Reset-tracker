"use client";

import { useApp } from "@/lib/store";
import { getCurrentStreak, getLongestStreak, getLast7Days } from "@/lib/calculations";
import { HABIT_LABELS, type HabitId } from "@/types";
import { motion } from "framer-motion";

interface StreakCardProps {
  habitId: HabitId;
  index: number;
}

export function StreakCard({ habitId, index }: StreakCardProps) {
  const { dayLogs } = useApp();
  const today = new Date().toISOString().slice(0, 10);
  const currentStreak = getCurrentStreak(dayLogs, habitId, today);
  const longestStreak = getLongestStreak(dayLogs, habitId, today);
  const last7 = getLast7Days(dayLogs, habitId, today);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-xl border border-white/10 bg-surface p-4"
    >
      <p className="mb-2 text-sm font-medium text-white/70">
        {HABIT_LABELS[habitId]}
      </p>
      <div className="mb-3 flex items-baseline gap-2">
        <span className="font-display text-3xl font-bold text-mint">
          {currentStreak}
        </span>
        <span className="text-sm text-white/50">day streak</span>
      </div>
      <p className="mb-3 text-xs text-white/40">
        Best: {longestStreak} days
      </p>
      <div className="flex gap-1">
        {last7.map((done, i) => (
          <div
            key={i}
            className={`h-2 flex-1 rounded-sm ${
              done ? "bg-mint/80" : "bg-white/10"
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}
