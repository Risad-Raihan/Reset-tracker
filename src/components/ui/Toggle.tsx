"use client";

import { motion } from "framer-motion";

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Toggle({
  checked,
  onChange,
  disabled = false,
  className = "",
}: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border border-white/10 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-mint/50 disabled:cursor-not-allowed ${
        checked ? "bg-mint/20" : "bg-surface-elevated"
      } ${className}`}
    >
      <motion.span
        className="absolute left-1 top-1 h-5 w-5 rounded-full bg-mint shadow-lg"
        initial={false}
        animate={{
          x: checked ? 22 : 0,
          scale: checked ? 1.05 : 1,
          backgroundColor: checked ? "#3DFFA0" : "rgba(255,255,255,0.3)",
        }}
        transition={{
          type: "spring",
          stiffness: 500,
          damping: 25,
        }}
      />
    </button>
  );
}
