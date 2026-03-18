"use client";

import { WeeklySummary } from "@/components/weekly/WeeklySummary";
import { motion } from "framer-motion";

export default function WeeklyPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <h1 className="font-display text-3xl font-bold text-white">
        Weekly Summary
      </h1>
      <WeeklySummary />
    </motion.div>
  );
}
