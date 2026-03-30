"use client";

import { AREA_ORDER } from "@/lib/modulo02/areas";

interface AreaProgressProps {
  currentArea: string;
  completedAreas: string[];
}

export function AreaProgress({ currentArea, completedAreas }: AreaProgressProps) {
  return (
    <div className="flex items-center gap-2">
      {AREA_ORDER.map((area) => {
        const isCompleted = completedAreas.includes(area);
        const isCurrent = area === currentArea;
        return (
          <span
            key={area}
            className={
              "h-2.5 w-2.5 rounded-full transition-colors duration-300 " +
              (isCompleted
                ? "bg-accent-cyan"
                : isCurrent
                  ? "animate-pulse border border-accent-cyan bg-transparent"
                  : "bg-white/20")
            }
          />
        );
      })}
    </div>
  );
}

