"use client";

import { format, subDays, startOfWeek, endOfWeek } from "date-fns";
import { useApp } from "@/lib/store";
import { motion } from "framer-motion";

export function DeepWorkStats() {
  const { deepWorkDays } = useApp();
  const today = format(new Date(), "yyyy-MM-dd");
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 0 });
  const weekStart = startOfWeek(new Date(), { weekStartsOn: 0 });

  let weeklyTotalMs = 0;
  let longestSessionMs = 0;
  let daysOver2h = 0;

  for (let d = new Date(weekStart); d <= weekEnd; d.setDate(d.getDate() + 1)) {
    const dateStr = format(d, "yyyy-MM-dd");
    const day = deepWorkDays[dateStr];
    if (day) {
      weeklyTotalMs += day.totalMs;
      if (day.totalMs >= 2 * 60 * 60 * 1000) daysOver2h++;
      for (const s of day.sessions) {
        if (s.durationMs > longestSessionMs) longestSessionMs = s.durationMs;
      }
    }
  }

  const weeklyHours = Math.floor(weeklyTotalMs / 3600000);
  const weeklyMins = Math.floor((weeklyTotalMs % 3600000) / 60000);
  const longestMins = Math.floor(longestSessionMs / 60000);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="grid gap-4 sm:grid-cols-3"
    >
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-white/10 bg-surface p-4"
      >
        <p className="text-sm text-white/50">This week</p>
        <p className="font-display text-2xl font-bold text-mint">
          {weeklyHours}h {weeklyMins}m
        </p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-white/10 bg-surface p-4"
      >
        <p className="text-sm text-white/50">Longest session</p>
        <p className="font-display text-2xl font-bold text-blue">
          {longestMins}m
        </p>
      </motion.div>
      <motion.div
        whileHover={{ scale: 1.02 }}
        className="rounded-xl border border-white/10 bg-surface p-4"
      >
        <p className="text-sm text-white/50">2h+ days this week</p>
        <p className="font-display text-2xl font-bold text-purple">
          {daysOver2h}
        </p>
      </motion.div>
    </motion.div>
  );
}
