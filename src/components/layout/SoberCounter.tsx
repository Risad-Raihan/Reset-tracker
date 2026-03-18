"use client";

import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { getSoberStats } from "@/lib/calculations";
import { motion } from "framer-motion";

const MILESTONES = [30, 60, 90, 180, 365];

export function SoberCounter() {
  const { days, hours } = getSoberStats();

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="rounded-xl border border-white/10 bg-surface p-4"
    >
      <p className="mb-1 text-xs font-medium uppercase tracking-wider text-white/50">
        Sober
      </p>
      <div className="flex items-baseline gap-2">
        <motion.span
          className="font-display text-4xl font-bold text-mint"
          animate={{ textShadow: ["0 0 20px rgba(61,255,160,0.3)", "0 0 30px rgba(61,255,160,0.5)", "0 0 20px rgba(61,255,160,0.3)"] }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <AnimatedNumber value={days} />
        </motion.span>
        <span className="font-mono text-lg text-white/70">days</span>
      </div>
      <p className="mt-1 font-mono text-sm text-white/50">
        {days} days, {hours} hours
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {MILESTONES.map((m) => {
          const unlocked = days >= m;
          return (
            <motion.span
              key={m}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 + MILESTONES.indexOf(m) * 0.05 }}
              className={`rounded-md px-2 py-0.5 font-mono text-xs ${
                unlocked
                  ? "bg-mint/20 text-mint"
                  : "bg-white/5 text-white/30"
              }`}
            >
              {m}d
            </motion.span>
          );
        })}
      </div>
    </motion.div>
  );
}
