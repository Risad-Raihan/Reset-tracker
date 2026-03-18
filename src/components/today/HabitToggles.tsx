"use client";

import { useApp } from "@/lib/store";
import { Toggle } from "@/components/ui/Toggle";
import { HABIT_LABELS, type HabitId } from "@/types";
import { motion } from "framer-motion";

interface HabitTogglesProps {
  date: string;
}

const HABIT_ORDER: HabitId[] = [
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
];

export function HabitToggles({ date }: HabitTogglesProps) {
  const { getDayLog, setHabit } = useApp();
  const log = getDayLog(date);

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: 0.06 },
        },
      }}
      className="grid gap-3 sm:grid-cols-2"
    >
      {HABIT_ORDER.map((habitId) => (
        <motion.div
          key={habitId}
          variants={{
            hidden: { opacity: 0, y: 10 },
            visible: { opacity: 1, y: 0 },
          }}
          className="flex items-center justify-between rounded-xl border border-white/10 bg-surface p-4 transition-colors hover:border-white/20"
        >
          <span className="font-medium text-white">
            {HABIT_LABELS[habitId]}
          </span>
          <Toggle
            checked={log.habits[habitId]}
            onChange={(checked) => setHabit(date, habitId, checked)}
          />
        </motion.div>
      ))}
    </motion.div>
  );
}
