"use client";

import { AREA_LABELS } from "@/lib/modulo02/areas";
import type { CriticalHabit } from "@/types/modulo02";

interface HabitCardProps {
  habit: CriticalHabit;
}

export function HabitCard({ habit }: HabitCardProps) {
  const area = habit.area in AREA_LABELS ? AREA_LABELS[habit.area as keyof typeof AREA_LABELS] : habit.area;
  return (
    <article className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wide text-accent-gold">
        {habit.priority.toString().padStart(2, "0")} / {area}
      </p>
      <h4 className="mt-2 text-lg font-semibold text-text-primary">{habit.habit}</h4>
      <p className="mt-2 text-sm font-medium text-accent-cyan">{habit.frequency}</p>
      <p className="mt-2 text-sm italic text-text-muted">{habit.reason}</p>
    </article>
  );
}

