"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { getCurrentStreak } from "@/lib/calculations";
import { StreakCard } from "@/components/streaks/StreakCard";
import { HeatmapGrid } from "@/components/streaks/HeatmapGrid";
import { MilestoneModal } from "@/components/streaks/MilestoneModal";
import { HABIT_IDS, HABIT_LABELS, STREAK_MILESTONES } from "@/types";
import { motion } from "framer-motion";

export default function StreaksPage() {
  const { dayLogs, celebratedMilestones, markMilestoneCelebrated } = useApp();
  const [milestone, setMilestone] = useState<{
    habitId: string;
    habitLabel: string;
    days: number;
  } | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    for (const habitId of HABIT_IDS) {
      const streak = getCurrentStreak(dayLogs, habitId, today);
      const celebrated = celebratedMilestones[habitId] ?? [];
      const hitMilestone = STREAK_MILESTONES.find(
        (m) => m === streak && !celebrated.includes(m)
      );
      if (hitMilestone) {
        setMilestone({
          habitId,
          habitLabel: HABIT_LABELS[habitId],
          days: hitMilestone,
        });
        break;
      }
    }
  }, [dayLogs, celebratedMilestones, today]);

  const handleCloseMilestone = () => {
    if (milestone) {
      markMilestoneCelebrated(milestone.habitId, milestone.days);
      setMilestone(null);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <h1 className="font-display text-3xl font-bold text-white">Streaks</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {HABIT_IDS.map((habitId, i) => (
          <StreakCard key={habitId} habitId={habitId} index={i} />
        ))}
      </div>

      <div>
        <h2 className="mb-4 font-display text-xl font-bold text-white">
          30-Day Heatmap
        </h2>
        <HeatmapGrid />
      </div>

      <MilestoneModal
        isOpen={!!milestone}
        onClose={handleCloseMilestone}
        habitLabel={milestone?.habitLabel ?? ""}
        days={milestone?.days ?? 0}
      />
    </motion.div>
  );
}
