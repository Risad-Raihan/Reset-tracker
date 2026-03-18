"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import {
  getDailyScore,
  getScoreLabel,
  getScoreColor,
  getSleepTimeStatus,
} from "@/lib/calculations";
import type { DayLog } from "@/types";
import { motion } from "framer-motion";

interface DailyScoreProps {
  log: DayLog;
}

export function DailyScore({ log }: DailyScoreProps) {
  const score = getDailyScore(log);
  const label = getScoreLabel(score);
  const colorClass = getScoreColor(score);
  const showFire = score >= 90;
  const sleepBad = log.sleepTime && getSleepTimeStatus(log.sleepTime) === "bad";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center rounded-xl border border-white/10 bg-surface p-8"
    >
      <p className="mb-2 text-sm font-medium uppercase tracking-wider text-white/50">
        Today&apos;s Score
      </p>
      <div className="flex items-baseline gap-2">
        <AnimatedNumber
          value={score}
          className={`font-display text-5xl font-bold ${colorClass}`}
        />
        <span className="font-mono text-2xl text-white/70">%</span>
      </div>
      <p className={`mt-2 font-display text-lg font-semibold ${colorClass}`}>
        {showFire && "🔥 "}
        {label}
      </p>
      {sleepBad && (
        <p className="mt-3 rounded-lg bg-coral/10 px-3 py-1.5 text-sm font-medium text-coral">
          Sleep outside 11 PM–5 AM
        </p>
      )}
    </motion.div>
  );
}
