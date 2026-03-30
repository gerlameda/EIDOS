"use client";

import type { VisionOption } from "@/lib/modulo02/vision-options";

interface VisionSelectorProps {
  options: VisionOption[];
  selectedStatement: string;
  isCustom: boolean;
  onChange: (statement: string, isCustom: boolean) => void;
}

export function VisionSelector({
  options,
  selectedStatement,
  isCustom,
  onChange,
}: VisionSelectorProps) {
  return (
    <section className="space-y-5">
      <h3 className="text-lg font-medium text-text-primary md:text-xl">
        ¿Cómo se ve tu vida cuando esto ya no es un problema?
      </h3>

      <div className="space-y-3">
        {options.map((opt) => {
          const selected = !isCustom && selectedStatement === opt.text;
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onChange(opt.text, false)}
              className={
                "w-full rounded-xl border bg-[#1A1A26] px-4 py-4 text-left text-sm leading-relaxed transition-colors duration-200 md:text-base " +
                (selected
                  ? "border-accent-cyan shadow-[0_0_0_1px_rgba(34,211,238,0.4)]"
                  : "border-[#2A2A3A] hover:border-white/30")
              }
            >
              {opt.text}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs uppercase tracking-wide text-text-muted">
        — o escribe tu propia visión —
      </p>

      <textarea
        value={isCustom ? selectedStatement : ""}
        onChange={(e) => onChange(e.target.value, true)}
        placeholder="¿Cómo se ve tu vida cuando esto ya funciona?"
        rows={3}
        className="w-full resize-none rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3 text-sm text-text-primary outline-none transition-colors duration-200 placeholder:text-text-muted focus:border-accent-cyan md:text-base"
      />
    </section>
  );
}

