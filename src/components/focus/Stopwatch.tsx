"use client";

import { useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import { useApp } from "@/lib/store";
import { AnimatedNumber } from "@/components/ui/AnimatedNumber";
import { motion } from "framer-motion";

function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}

export function Stopwatch() {
  const { deepWorkDays, addDeepWorkSession } = useApp();
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedMs, setElapsedMs] = useState(0);
  const startTimeRef = useRef<number | null>(null);

  const today = format(new Date(), "yyyy-MM-dd");
  const todayData = deepWorkDays[today] ?? { date: today, totalMs: 0, sessions: [] };

  useEffect(() => {
    if (!isRunning) return;
    const interval = setInterval(() => {
      if (startTimeRef.current) {
        setElapsedMs(Date.now() - startTimeRef.current);
      }
    }, 100);
    return () => clearInterval(interval);
  }, [isRunning]);

  const handleStart = () => {
    if (!isRunning) {
      startTimeRef.current = Date.now() - elapsedMs;
      setIsRunning(true);
    }
  };

  const handleStop = () => {
    if (isRunning && startTimeRef.current) {
      const endTime = new Date().toISOString();
      const startTime = new Date(startTimeRef.current).toISOString();
      const durationMs = Date.now() - startTimeRef.current;
      addDeepWorkSession(today, {
        id: crypto.randomUUID(),
        startTime,
        endTime,
        durationMs,
      });
      setElapsedMs(0);
      startTimeRef.current = null;
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setElapsedMs(0);
    startTimeRef.current = isRunning ? Date.now() : null;
  };

  const totalMinutes = Math.floor(todayData.totalMs / 60000);
  const totalHours = Math.floor(totalMinutes / 60);
  const totalMins = totalMinutes % 60;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-surface p-8"
    >
      <div className="flex flex-col items-center">
        <motion.div
          className={`relative flex h-48 w-48 items-center justify-center rounded-full border-2 ${
            isRunning ? "border-mint" : "border-white/20"
          }`}
          animate={
            isRunning
              ? {
                  boxShadow: [
                    "0 0 20px rgba(61,255,160,0.3)",
                    "0 0 40px rgba(61,255,160,0.5)",
                    "0 0 20px rgba(61,255,160,0.3)",
                  ],
                }
              : {}
          }
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
        >
          <span className="font-mono text-4xl font-bold text-white tabular-nums">
            {formatDuration(elapsedMs)}
          </span>
        </motion.div>

        <div className="mt-6 flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStart}
            disabled={isRunning}
            className="rounded-lg bg-mint/20 px-6 py-2.5 font-medium text-mint transition-colors hover:bg-mint/30 disabled:opacity-50"
          >
            Start
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleStop}
            disabled={!isRunning}
            className="rounded-lg bg-coral/20 px-6 py-2.5 font-medium text-coral transition-colors hover:bg-coral/30 disabled:opacity-50"
          >
            Stop & Save
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleReset}
            disabled={isRunning}
            className="rounded-lg border border-white/20 px-6 py-2.5 font-medium text-white/80 transition-colors hover:bg-white/5 disabled:opacity-50"
          >
            Reset
          </motion.button>
        </div>

        <p className="mt-6 font-display text-xl text-mint">
          Today:{" "}
          <AnimatedNumber value={totalHours} className="text-mint" />h{" "}
          <AnimatedNumber value={totalMins} className="text-mint" />m
        </p>
      </div>

      {todayData.sessions.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-8 border-t border-white/10 pt-6"
        >
          <h3 className="mb-4 font-display text-sm font-bold text-white/70">
            Today&apos;s sessions
          </h3>
          <div className="space-y-2">
            {todayData.sessions.map((session, i) => (
              <motion.div
                key={session.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex items-center justify-between rounded-lg bg-surface-elevated px-4 py-2"
              >
                <span className="font-mono text-sm text-white/70">
                  {format(new Date(session.startTime), "HH:mm")} –{" "}
                  {format(new Date(session.endTime), "HH:mm")}
                </span>
                <span className="font-mono font-medium text-mint">
                  {Math.floor(session.durationMs / 60000)}m
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
