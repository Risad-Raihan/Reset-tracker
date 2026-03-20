"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";

const NAV_ITEMS = [
  { href: "/today", label: "Today" },
  { href: "/focus", label: "Focus" },
  { href: "/streaks", label: "Streaks" },
  { href: "/charts", label: "Charts" },
  { href: "/books", label: "Books" },
  { href: "/notes", label: "Notes" },
  { href: "/weekly", label: "Weekly" },
] as const;

export function NavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
        return (
          <Link
            key={item.href}
            href={item.href}
            className="relative flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white"
          >
            {isActive && (
              <motion.span
                layoutId="nav-pill"
                className="absolute inset-0 rounded-lg bg-mint/10"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${isActive ? "text-mint" : "text-white/70"}`}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
