"use client";

import type { DayOfWeek } from "@/types/modulo03";

const DAYS: { key: DayOfWeek; label: string }[] = [
  { key: "lun", label: "L" },
  { key: "mar", label: "M" },
  { key: "mié", label: "X" },
  { key: "jue", label: "J" },
  { key: "vie", label: "V" },
  { key: "sáb", label: "S" },
  { key: "dom", label: "D" },
];

type DaySelectorProps = {
  selected: DayOfWeek[];
  onChange: (days: DayOfWeek[]) => void;
};

export function DaySelector({ selected, onChange }: DaySelectorProps) {
  const toggle = (d: DayOfWeek) => {
    if (selected.includes(d)) {
      onChange(selected.filter((x) => x !== d));
    } else {
      onChange([...selected, d]);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {DAYS.map(({ key, label }) => {
        const on = selected.includes(key);
        return (
          <button
            key={key}
            type="button"
            onClick={() => toggle(key)}
            className={
              "flex h-9 w-9 items-center justify-center rounded-full border text-xs font-medium transition-colors duration-200 " +
              (on
                ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                : "border-[#2A2A3A] bg-[#1A1A26] text-[rgba(240,237,232,0.6)]")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
