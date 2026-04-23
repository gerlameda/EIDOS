"use client";

import {
  XP_PER_LEVEL,
  levelFromXp,
  useBossStore,
  xpProgressPercent,
} from "@/store/bossStore";

interface XPBarProps {
  className?: string;
}

/**
 * Barra de XP con fill animado + shimmer cuando el jugador gana XP.
 * El shimmer usa key-based remount (key=totalXp) para que el CSS replay
 * naturalmente en cada ganancia. React 19 friendly: cero setState/refs.
 */
export function XPBar({ className }: XPBarProps) {
  const totalXp = useBossStore((s) => s.totalXp);

  const level = levelFromXp(totalXp);
  const pct = xpProgressPercent(totalXp);
  const xpInLevel = totalXp % XP_PER_LEVEL;

  return (
    <div className={className ?? "w-full"}>
      <div className="mb-1 flex items-center justify-between font-mono text-[10px] uppercase tracking-widest">
        <span className="text-[#22D3EE]">LVL {level}</span>
        <span className="text-[rgba(240,237,232,0.4)]">
          {xpInLevel} / {XP_PER_LEVEL} XP
        </span>
      </div>
      <div className="relative h-1.5 w-full overflow-hidden rounded-full bg-[#1A1A26] ring-1 ring-[#2A2A3A]">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            backgroundImage:
              "linear-gradient(90deg, #22D3EE 0%, #C9A84C 100%)",
            boxShadow:
              "0 0 12px rgba(34, 211, 238, 0.55), 0 0 4px rgba(201, 168, 76, 0.4)",
          }}
        />
        <div
          key={`shimmer-${totalXp}`}
          className="animate-xp-shimmer pointer-events-none absolute inset-0 rounded-full"
        />
      </div>
    </div>
  );
}
