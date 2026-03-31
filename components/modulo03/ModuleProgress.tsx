"use client";

type ModuleProgressProps = {
  currentStep: 1 | 2 | 3;
  stepLabel: string;
};

export function ModuleProgress({ currentStep, stepLabel }: ModuleProgressProps) {
  const steps = [1, 2, 3] as const;
  return (
    <div className="space-y-3">
      <p className="text-center text-sm text-[rgba(240,237,232,0.6)]">
        {stepLabel}
      </p>
      <div className="flex justify-center gap-2">
        {steps.map((s) => {
          const done = s < currentStep;
          const active = s === currentStep;
          return (
            <span
              key={s}
              className={
                "h-2.5 w-2.5 rounded-full border transition-colors duration-300 " +
                (done
                  ? "border-accent-cyan bg-accent-cyan/50"
                  : active
                    ? "border-accent-cyan bg-accent-cyan shadow-[0_0_12px_rgba(34,211,238,0.45)]"
                    : "border-[#2A2A3A] bg-[#1A1A26]")
              }
              aria-hidden
            />
          );
        })}
      </div>
    </div>
  );
}
