"use client";

export interface Scale1to5QuestionProps {
  question: string;
  labels: [string, string, string, string, string];
  selected: number | null; // 1–5, null si no hay selección
  onSelect: (value: 1 | 2 | 3 | 4 | 5) => void;
}

const VALUES = [1, 2, 3, 4, 5] as const;

export function Scale1to5Question({
  question,
  labels,
  selected,
  onSelect,
}: Scale1to5QuestionProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] px-6">
      <h2 className="text-xl font-normal leading-snug text-[#F0EDE8] md:text-2xl">
        {question}
      </h2>
      <div className="mt-8 flex justify-center gap-2 sm:gap-3 md:gap-4">
        {VALUES.map((value, i) => {
          const isSelected = selected === value;
          return (
            <div
              key={value}
              className="flex min-w-0 flex-1 flex-col items-center gap-2"
            >
              <button
                type="button"
                aria-pressed={isSelected}
                onClick={() => onSelect(value)}
                className={
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 sm:h-12 sm:w-12 " +
                  (isSelected
                    ? "border-[#22D3EE] bg-[#22D3EE] text-[#0D0D14]"
                    : "border-[rgba(240,237,232,0.1)] bg-transparent text-[#F0EDE8]")
                }
              >
                {value}
              </button>
              <span className="line-clamp-2 max-w-[4.5rem] text-center text-[10px] leading-tight text-[rgba(240,237,232,0.5)] sm:max-w-none sm:text-xs">
                {labels[i]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
