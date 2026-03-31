"use client";

import type { SprintCommitment, TimeOfDay } from "@/types/modulo03";
import { AREA_LABELS, type Modulo02Area } from "@/lib/modulo02/areas";
import { DaySelector } from "@/components/modulo03/DaySelector";

export type SprintEditorProps = {
  value: SprintCommitment[];
  onChange: (commitments: SprintCommitment[]) => void;
  showErrors?: boolean;
};

function areaLabel(area: string): string {
  const a = area as Modulo02Area;
  return AREA_LABELS[a]?.toUpperCase() ?? area.toUpperCase();
}

const TIME_OPTIONS: TimeOfDay[] = ["mañana", "tarde", "noche"];

export function SprintEditor({
  value,
  onChange,
  showErrors = false,
}: SprintEditorProps) {
  const patch = (priority: 1 | 2 | 3, partial: Partial<SprintCommitment>) => {
    onChange(
      value.map((c) =>
        c.habitPriority === priority ? { ...c, ...partial } : c,
      ),
    );
  };

  return (
    <div className="space-y-8">
      {value.map((c, idx) => {
        const noDays = c.days.length === 0;
        const noText = c.commitment.trim().length === 0;
        const err = showErrors && (noDays || noText);
        const prioLabel = String(c.habitPriority).padStart(2, "0");
        return (
          <div key={c.habitPriority}>
            <div className="space-y-4">
              <p className="text-2xl font-semibold text-accent-gold">{prioLabel}</p>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-cyan">
                {areaLabel(c.area)}
              </p>
              <h3 className="text-xl font-semibold text-[#F0EDE8]">{c.habit}</h3>
              <DaySelector
                selected={c.days}
                onChange={(days) => patch(c.habitPriority, { days })}
              />
              <div className="flex flex-wrap justify-center gap-2">
                {TIME_OPTIONS.map((t) => {
                  const on = c.timeOfDay === t;
                  const cap =
                    t === "mañana"
                      ? "Mañana"
                      : t === "tarde"
                        ? "Tarde"
                        : "Noche";
                  return (
                    <button
                      key={t}
                      type="button"
                      onClick={() => patch(c.habitPriority, { timeOfDay: t })}
                      className={
                        "rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 " +
                        (on
                          ? "border-accent-cyan bg-accent-cyan/15 text-accent-cyan"
                          : "border-[#2A2A3A] bg-[#1A1A26] text-[rgba(240,237,232,0.6)]")
                      }
                    >
                      {cap}
                    </button>
                  );
                })}
              </div>
              <div>
                <label
                  className="mb-1 block text-xs text-[rgba(240,237,232,0.6)]"
                  htmlFor={`commit-${c.habitPriority}`}
                >
                  Mi compromiso
                </label>
                <textarea
                  id={`commit-${c.habitPriority}`}
                  value={c.commitment}
                  onChange={(e) =>
                    patch(c.habitPriority, { commitment: e.target.value })
                  }
                  placeholder="Voy a..."
                  rows={4}
                  className="min-h-[120px] w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-3 py-3 text-sm leading-relaxed text-[#F0EDE8] placeholder:text-[rgba(240,237,232,0.35)] focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
                />
              </div>
              {err ? (
                <p className="text-xs text-red-400/90">
                  {noDays && noText
                    ? "Elige al menos un día y escribe tu compromiso."
                    : noDays
                      ? "Elige al menos un día."
                      : "Escribe tu compromiso."}
                </p>
              ) : null}
            </div>
            {idx < value.length - 1 ? (
              <div className="my-8 border-t border-[#2A2A3A]" />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
