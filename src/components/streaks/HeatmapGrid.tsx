"use client";

import { useState } from "react";
import { format, subDays } from "date-fns";
import { useApp } from "@/lib/store";
import { getSleepTimeStatus } from "@/lib/calculations";
import { HABIT_LABELS, HABIT_IDS, type HabitId } from "@/types";
import { SlideOver } from "@/components/ui/SlideOver";
import { motion } from "framer-motion";

const DAYS = 30;

export function HeatmapGrid() {
  const { dayLogs } = useApp();
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const today = new Date();
  const dates = Array.from({ length: DAYS }, (_, i) =>
    format(subDays(today, DAYS - 1 - i), "yyyy-MM-dd")
  );

  const selectedLog = selectedDate ? dayLogs[selectedDate] : null;

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="overflow-x-auto rounded-xl border border-white/10 bg-surface p-4"
      >
        <table className="w-full min-w-[600px] border-collapse">
          <thead>
            <tr>
              <th className="pb-2 text-left text-xs font-medium text-white/50">
                Habit
              </th>
              {dates.map((d) => (
                <th
                  key={d}
                  className="px-0.5 pb-2 text-center font-mono text-[10px] text-white/40"
                >
                  {format(new Date(d), "d")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {HABIT_IDS.map((habitId) => (
              <tr key={habitId}>
                <td className="py-1 pr-2 text-xs text-white/70">
                  {HABIT_LABELS[habitId]}
                </td>
                {dates.map((date) => {
                  const done = dayLogs[date]?.habits[habitId] ?? false;
                  return (
                    <td key={date} className="p-0.5">
                      <button
                        type="button"
                        onClick={() => setSelectedDate(date)}
                        className={`block h-4 w-4 rounded-sm transition-colors hover:ring-1 hover:ring-white/30 ${
                          done ? "bg-mint/70" : "bg-white/10"
                        }`}
                        title={`${date} - ${done ? "Done" : "Not done"}`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="py-1 pr-2 text-xs text-white/70">
                Sleep on time (11 PM–5 AM)
              </td>
              {dates.map((date) => {
                const log = dayLogs[date];
                const sleepTime = log?.sleepTime;
                const onTime = sleepTime
                  ? getSleepTimeStatus(sleepTime) === "good"
                  : null;
                return (
                  <td key={date} className="p-0.5">
                    <button
                      type="button"
                      onClick={() => setSelectedDate(date)}
                      className={`block h-4 w-4 rounded-sm transition-colors hover:ring-1 hover:ring-white/30 ${
                        onTime === true
                          ? "bg-mint/70"
                          : onTime === false
                            ? "bg-coral/70"
                            : "bg-white/10"
                      }`}
                      title={`${date} - ${onTime === true ? "On time" : onTime === false ? "Outside window" : "No data"}`}
                    />
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </motion.div>

      <SlideOver
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? format(new Date(selectedDate), "EEEE, MMMM d") : ""}
      >
        {selectedDate && (
          <div className="space-y-4">
            {selectedLog ? (
              <>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-white/60">Habits</p>
                  <div className="space-y-1">
                    {HABIT_IDS.map((id) => (
                      <div
                        key={id}
                        className="flex items-center justify-between rounded-lg bg-surface-elevated px-3 py-2"
                      >
                        <span className="text-sm text-white">
                          {HABIT_LABELS[id]}
                        </span>
                        <span
                          className={
                            selectedLog.habits[id] ? "text-mint" : "text-white/40"
                          }
                        >
                          {selectedLog.habits[id] ? "✓" : "—"}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                {(selectedLog.sleepTime || selectedLog.wakeTime) && (
                  <div className="rounded-lg bg-surface-elevated px-3 py-2">
                    <p className="font-mono text-sm text-white/70">
                      Sleep: {selectedLog.sleepTime || "—"} →{" "}
                      {selectedLog.wakeTime || "—"}
                    </p>
                    {selectedLog.sleepTime && (
                      <p
                        className={`mt-1 text-xs font-medium ${
                          getSleepTimeStatus(selectedLog.sleepTime) === "good"
                            ? "text-mint"
                            : "text-coral"
                        }`}
                      >
                        {getSleepTimeStatus(selectedLog.sleepTime) === "good"
                          ? "✓ On time (11 PM–5 AM)"
                          : "⚠ Outside target window"}
                      </p>
                    )}
                  </div>
                )}
                {selectedLog.note && (
                  <div>
                    <p className="mb-1 text-sm text-white/60">Note</p>
                    <p className="text-sm text-white/80">{selectedLog.note}</p>
                  </div>
                )}
              </>
            ) : (
              <p className="text-white/60">No data for this day.</p>
            )}
          </div>
        )}
      </SlideOver>
    </>
  );
}
