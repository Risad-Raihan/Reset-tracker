"use client";

import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { getReadingStreak } from "@/lib/calculations";
import { motion } from "framer-motion";

export function ReadingStreak() {
  const { books } = useApp();
  const today = format(new Date(), "yyyy-MM-dd");
  const streak = getReadingStreak(books, today);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-xl border border-white/10 bg-surface p-4"
    >
      <p className="text-sm text-white/60">Reading streak</p>
      <p className="font-display text-3xl font-bold text-mint">{streak}</p>
      <p className="text-xs text-white/50">consecutive days</p>
    </motion.div>
  );
}
