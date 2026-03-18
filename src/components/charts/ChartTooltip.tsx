"use client";

interface DarkTooltipProps {
  active?: boolean;
  payload?: Array<{ name?: string; value?: number; dataKey?: string; color?: string }>;
  label?: string;
  formatter?: (v: number) => string;
}

export function DarkTooltip({
  active,
  payload,
  label,
  formatter,
}: DarkTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-white/10 bg-surface px-3 py-2 shadow-xl">
      <p className="mb-1 font-mono text-xs text-white/60">{label}</p>
      {payload.map((entry, i) => (
        <p key={entry.dataKey ?? i} className="text-sm font-medium" style={{ color: entry.color }}>
          {entry.name}: {formatter && entry.value != null ? formatter(Number(entry.value)) : entry.value}
        </p>
      ))}
    </div>
  );
}
