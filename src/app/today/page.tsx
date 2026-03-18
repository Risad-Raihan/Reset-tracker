"use client";

import { useState } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { TaskSlots } from "@/components/tasks/TaskSlots";
import { DailyScore } from "@/components/today/DailyScore";
import { HabitToggles } from "@/components/today/HabitToggles";
import { DailyMetrics } from "@/components/today/DailyMetrics";
import { motion } from "framer-motion";

export default function TodayPage() {
  const [selectedDate, setSelectedDate] = useState(() =>
    format(new Date(), "yyyy-MM-dd")
  );
  const { getDayLog } = useApp();
  const log = getDayLog(selectedDate);

  const todayStr = format(new Date(), "yyyy-MM-dd");
  const isToday = selectedDate === todayStr;
  const hour = new Date().getHours();
  const showNightPrompt = hour >= 21 && isToday;

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-white">
          {isToday ? "Today" : format(new Date(selectedDate), "EEEE, MMMM d")}
        </h1>
        <div className="flex items-center gap-2">
          <label className="text-sm text-white/60">View date:</label>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            max={todayStr}
            className="rounded-lg border border-white/10 bg-surface-elevated px-4 py-2 font-mono text-sm text-white focus:border-mint/50 focus:outline-none"
          />
        </div>
      </div>

      {isToday && (
        <TaskSlots date={selectedDate} showNightPrompt={showNightPrompt} />
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        <DailyScore log={log} />
        <div className="space-y-6">
          <HabitToggles date={selectedDate} />
          <DailyMetrics date={selectedDate} log={log} />
        </div>
      </div>
    </motion.div>
  );
}
