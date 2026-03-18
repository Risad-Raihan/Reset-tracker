"use client";

import { format } from "date-fns";
import { SoberCounter } from "./SoberCounter";
import { NavLinks } from "./NavLinks";
import { DataManagement } from "@/components/settings/DataManagement";
import { useApp } from "@/lib/store";
import { getDaysTracked, getCurrentStreak, getSleepOnTimeLast7 } from "@/lib/calculations";
import { HABIT_IDS } from "@/types";

export function Sidebar() {
  const { dayLogs, isHydrated } = useApp();
  const today = format(new Date(), "yyyy-MM-dd");
  const daysTracked = getDaysTracked(dayLogs);

  let longestStreak = 0;
  const sleep7 = getSleepOnTimeLast7(dayLogs);
  if (isHydrated) {
    for (const habitId of HABIT_IDS) {
      const streak = getCurrentStreak(dayLogs, habitId, today);
      if (streak > longestStreak) longestStreak = streak;
    }
  }

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[260px] flex-col border-r border-white/10 bg-bg">
      <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-4">
        <SoberCounter />
        <NavLinks />
      </div>
      <div className="border-t border-white/10 p-4">
        <p className="font-mono text-sm text-white/70">
          {format(new Date(), "EEE, MMM d")}
        </p>
        <p className="mt-1 text-xs text-white/50">
          {daysTracked} days tracked · {longestStreak} day streak
        </p>
        {sleep7.total > 0 && (
          <p
            className={`mt-0.5 text-xs ${
              sleep7.onTime === sleep7.total ? "text-mint" : sleep7.onTime === 0 ? "text-coral" : "text-amber"
            }`}
          >
            Sleep: {sleep7.onTime}/{sleep7.total} on time (7d)
          </p>
        )}
        <DataManagement />
      </div>
    </aside>
  );
}
