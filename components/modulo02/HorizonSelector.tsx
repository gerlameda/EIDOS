"use client";

import type { HorizonOption } from "@/lib/modulo02/horizon-options";
import type { VisionHorizon } from "@/types/modulo02";

interface HorizonSelectorProps {
  options: HorizonOption[];
  selected: VisionHorizon | null;
  onChange: (horizon: VisionHorizon) => void;
  visible: boolean;
}

export function HorizonSelector({
  options,
  selected,
  onChange,
  visible,
}: HorizonSelectorProps) {
  return (
    <section
      className={
        "space-y-4 transition-all duration-300 " +
        (visible
          ? "translate-y-0 opacity-100"
          : "pointer-events-none translate-y-2 opacity-0")
      }
    >
      <h3 className="text-lg font-medium text-text-primary md:text-xl">
        ¿Cuándo quieres poder decir esto?
      </h3>

      <div className="grid gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const isSelected = selected === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              className={
                "rounded-xl border px-3 py-3 text-left transition-colors duration-200 " +
                (isSelected
                  ? "border-accent-gold bg-accent-gold/10"
                  : "border-white/15 bg-transparent hover:border-white/30")
              }
            >
              <p className="text-sm font-medium text-text-primary">{opt.label}</p>
              <p
                className={
                  "mt-1 text-xs transition-opacity duration-200 " +
                  (isSelected ? "opacity-100 text-text-muted" : "opacity-0")
                }
              >
                {opt.sublabel}
              </p>
            </button>
          );
        })}
      </div>
    </section>
  );
}

