"use client";

import { useEffect, useRef } from "react";
import { format, subDays } from "date-fns";
import { useApp } from "@/lib/store";
import { motion } from "framer-motion";
import type { Task, TaskPriority } from "@/types";

const PRIORITY_CONFIG: Record<TaskPriority, { emoji: string; label: string; color: string }> = {
  critical: { emoji: "🔴", label: "Critical", color: "text-coral" },
  important: { emoji: "🟡", label: "Important", color: "text-amber" },
  nice: { emoji: "🟢", label: "Nice to have", color: "text-mint" },
};

interface TaskSlotsProps {
  date: string;
  showNightPrompt?: boolean;
}

export function TaskSlots({ date, showNightPrompt = false }: TaskSlotsProps) {
  const { getTaskDay, setTask, setTaskDay } = useApp();
  const todayStr = format(new Date(), "yyyy-MM-dd");
  const taskDay = getTaskDay(date);
  const yesterday = format(subDays(new Date(date), 1), "yyyy-MM-dd");
  const yesterdayTasks = getTaskDay(yesterday);
  const tasks = taskDay.tasks;

  const carriedOverRef = useRef(false);
  useEffect(() => {
    if (date !== todayStr || carriedOverRef.current) return;
    const unfinished = yesterdayTasks.tasks.filter((t) => !t.done && t.text.trim());
    const todayEmpty = tasks.every((t) => !t.text.trim());
    if (unfinished.length > 0 && todayEmpty) {
      carriedOverRef.current = true;
      const carried = unfinished.map((t) => ({ ...t, carriedOver: true }));
      while (carried.length < 3) carried.push({ id: crypto.randomUUID(), text: "", priority: "important" as TaskPriority, done: false, carriedOver: false });
      setTaskDay(date, carried.slice(0, 3));
    }
  }, [date, todayStr, yesterdayTasks.tasks, tasks, setTaskDay]);

  const carriedOver = date === todayStr && tasks.some((t) => t.carriedOver);

  const handleTaskChange = (index: number, updates: Partial<Task>) => {
    setTask(date, index, updates);
  };

  const handlePriorityCycle = (index: number) => {
    const order: TaskPriority[] = ["critical", "important", "nice"];
    const current = tasks[index].priority;
    const next = order[(order.indexOf(current) + 1) % order.length];
    setTask(date, index, { priority: next });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-white/10 bg-surface p-6"
    >
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-lg font-bold text-white">
          Your 3 tasks for today
        </h2>
        {showNightPrompt && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm text-amber"
          >
            Set tomorrow&apos;s tasks?
          </motion.p>
        )}
      </div>
      <div className="space-y-3">
        {tasks.slice(0, 3).map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`flex items-center gap-3 rounded-lg border border-white/10 bg-surface-elevated p-3 ${task.carriedOver ? "ring-1 ring-amber/50" : ""}`}
          >
            <input
              type="checkbox"
              checked={task.done}
              onChange={(e) => handleTaskChange(index, { done: e.target.checked })}
              className="h-5 w-5 rounded border-white/20 bg-transparent text-mint focus:ring-mint"
            />
            <div className="flex flex-1 items-center gap-2">
              <input
                type="text"
                value={task.text}
                onChange={(e) => handleTaskChange(index, { text: e.target.value })}
                placeholder={`Task ${index + 1}`}
                className="flex-1 bg-transparent font-medium text-white placeholder:text-white/40 focus:outline-none"
              />
              {task.carriedOver && (
                <span className="shrink-0 rounded bg-amber/20 px-2 py-0.5 text-xs text-amber">
                  Carried over
                </span>
              )}
            </div>
            <button
              type="button"
              onClick={() => handlePriorityCycle(index)}
              className={`rounded px-2 py-1 text-xs ${PRIORITY_CONFIG[task.priority].color}`}
              title={PRIORITY_CONFIG[task.priority].label}
            >
              {PRIORITY_CONFIG[task.priority].emoji}
            </button>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
