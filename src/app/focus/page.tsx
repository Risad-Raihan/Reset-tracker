"use client";

import { Stopwatch } from "@/components/focus/Stopwatch";
import { DeepWorkStats } from "@/components/focus/DeepWorkStats";
import { motion } from "framer-motion";

export default function FocusPage() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      <h1 className="font-display text-3xl font-bold text-white">
        Deep Work Timer
      </h1>

      <DeepWorkStats />

      <Stopwatch />
    </motion.div>
  );
}
