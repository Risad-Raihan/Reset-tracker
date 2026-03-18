"use client";

import { AppProvider } from "@/lib/store";
import { Sidebar } from "./Sidebar";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AppProvider>
      <div className="flex min-h-screen bg-bg">
        <Sidebar />
        <main className="ml-[260px] flex-1 p-8">{children}</main>
      </div>
    </AppProvider>
  );
}
