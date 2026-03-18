"use client";

import { useEffect, useState } from "react";
import { useMotionValue, useSpring, useMotionValueEvent } from "framer-motion";

interface AnimatedNumberProps {
  value: number;
  className?: string;
  decimals?: number;
}

export function AnimatedNumber({
  value,
  className = "",
  decimals = 0,
}: AnimatedNumberProps) {
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    stiffness: 75,
    damping: 15,
  });
  const [display, setDisplay] = useState("0");

  useMotionValueEvent(springValue, "change", (v) => {
    setDisplay(v.toFixed(decimals));
  });

  useEffect(() => {
    motionValue.set(value);
  }, [motionValue, value]);

  return (
    <span
      className={className}
      style={{ fontVariantNumeric: "tabular-nums" }}
    >
      {display}
    </span>
  );
}
