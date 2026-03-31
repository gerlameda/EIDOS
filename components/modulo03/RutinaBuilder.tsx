"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { CriticalHabit } from "@/types/modulo02";
import type { RutinaBase, TimeOfDay } from "@/types/modulo03";

export type RutinaBuilderProps = {
  criticalHabits: CriticalHabit[];
  initialRutina: RutinaBase;
  onChange: (rutina: RutinaBase) => void;
};

function SunGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <circle cx="12" cy="12" r="4" stroke="#22D3EE" strokeWidth="1.5" />
      <path
        d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.5 1.5M16.9 16.9l1.5 1.5M18.4 5.6l-1.5 1.5M7.1 16.9l-1.5 1.5"
        stroke="#C9A84C"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function AfternoonGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M4 16c4-5 12-5 16 0"
        stroke="#22D3EE"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MoonGlyph() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M10 4a6 6 0 1 0 6 10 7 7 0 0 1-6-10z"
        stroke="#F0EDE8"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function blockFromTime(t: TimeOfDay): keyof RutinaBase {
  if (t === "mañana") return "manana";
  if (t === "tarde") return "tarde";
  return "noche";
}

function buildRutina(
  habits: CriticalHabit[],
  map: Record<number, TimeOfDay>,
): RutinaBase {
  const r: RutinaBase = {
    manana: { timeOfDay: "mañana", habits: [] },
    tarde: { timeOfDay: "tarde", habits: [] },
    noche: { timeOfDay: "noche", habits: [] },
  };
  for (const h of habits) {
    const t = map[h.priority] ?? "mañana";
    r[blockFromTime(t)].habits.push(h.habit);
  }
  return r;
}

function initialMapFromRutina(
  habits: CriticalHabit[],
  rutina: RutinaBase,
): Record<number, TimeOfDay> {
  const m: Partial<Record<number, TimeOfDay>> = {};
  for (const h of habits) {
    if (rutina.manana.habits.includes(h.habit)) m[h.priority] = "mañana";
    else if (rutina.tarde.habits.includes(h.habit)) m[h.priority] = "tarde";
    else m[h.priority] = "noche";
  }
  return m as Record<number, TimeOfDay>;
}

export function RutinaBuilder({
  criticalHabits,
  initialRutina,
  onChange,
}: RutinaBuilderProps) {
  const sorted = useMemo(
    () => [...criticalHabits].sort((a, b) => a.priority - b.priority),
    [criticalHabits],
  );

  const [assignments, setAssignments] = useState<Record<number, TimeOfDay>>(
    () => initialMapFromRutina(sorted, initialRutina),
  );

  const rutina = useMemo(
    () => buildRutina(sorted, assignments),
    [sorted, assignments],
  );

  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current(rutina);
  }, [rutina]);

  const setSlot = (priority: number, t: TimeOfDay) => {
    setAssignments((prev) => ({ ...prev, [priority]: t }));
  };

  const blocks: { key: keyof RutinaBase; label: string; glyph: ReactNode }[] =
    [
      { key: "manana", label: "Mañana", glyph: <SunGlyph /> },
      { key: "tarde", label: "Tarde", glyph: <AfternoonGlyph /> },
      { key: "noche", label: "Noche", glyph: <MoonGlyph /> },
    ];

  return (
    <div className="space-y-6">
      {blocks.map(({ key, label, glyph }) => {
        const habitsHere = rutina[key].habits;
        return (
          <div key={key} className="rounded-xl border border-[#2A2A3A] bg-[#1A1A26]/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              {glyph}
              <span className="text-base font-medium text-[#F0EDE8]">{label}</span>
            </div>
            {habitsHere.length === 0 ? (
              <p className="text-sm italic text-[rgba(240,237,232,0.6)]">
                Sin hábitos asignados
              </p>
            ) : (
              <ul className="space-y-3">
                {habitsHere.map((habitName) => {
                  const h = sorted.find((x) => x.habit === habitName);
                  const pr = h?.priority ?? 1;
                  const val = assignments[pr] ?? "mañana";
                  return (
                    <li
                      key={`${key}-${habitName}`}
                      className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between"
                    >
                      <span className="rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8]">
                        {habitName}
                      </span>
                      <label className="sr-only" htmlFor={`slot-${pr}`}>
                        Bloque para {habitName}
                      </label>
                      <select
                        id={`slot-${pr}`}
                        value={val}
                        onChange={(e) =>
                          setSlot(pr, e.target.value as TimeOfDay)
                        }
                        className="rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                      >
                        <option value="mañana">Mañana</option>
                        <option value="tarde">Tarde</option>
                        <option value="noche">Noche</option>
                      </select>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        );
      })}
    </div>
  );
}
