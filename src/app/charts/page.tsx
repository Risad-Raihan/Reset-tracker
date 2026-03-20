"use client";

import { useState } from "react";
import { TimeRangeSelector, type TimeRange } from "@/components/charts/TimeRangeSelector";
import { DeepWorkChart } from "@/components/charts/DeepWorkChart";
import { ScoreTrend } from "@/components/charts/ScoreTrend";
import { SleepChart } from "@/components/charts/SleepChart";
import { CoffeeChart } from "@/components/charts/CoffeeChart";
import { MoodEnergyChart } from "@/components/charts/MoodEnergyChart";
import { HabitRateChart } from "@/components/charts/HabitRateChart";
import { WeekdayChart } from "@/components/charts/WeekdayChart";
import { motion } from "framer-motion";

export default function ChartsPage() {
  const [range, setRange] = useState<TimeRange>("30");

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-display text-3xl font-bold text-white">
          Charts & Analytics
        </h1>
        <TimeRangeSelector value={range} onChange={setRange} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl border border-white/10 bg-surface p-6 lg:col-span-2"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Deep Work Time
          </h2>
          <DeepWorkChart range={range} />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Daily Score Trend
          </h2>
          <ScoreTrend range={range} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Sleep Time (Bedtime)
          </h2>
          <SleepChart range={range} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Coffee & Sleep Correlation
          </h2>
          <CoffeeChart range={range} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Energy & Mood
          </h2>
          <MoodEnergyChart range={range} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Habit Completion Rate
          </h2>
          <HabitRateChart range={range} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="rounded-xl border border-white/10 bg-surface p-6"
        >
          <h2 className="mb-4 font-display text-lg font-bold text-white">
            Best Day of Week
          </h2>
          <WeekdayChart />
        </motion.div>
      </div>
    </motion.div>
  );
}
