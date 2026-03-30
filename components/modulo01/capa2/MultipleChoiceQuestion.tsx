"use client";

export interface MultipleChoiceQuestionProps {
  question: string;
  options: string[]; // siempre 4 opciones
  selected: number | null; // índice 0–3, null si no hay selección
  onSelect: (index: number) => void;
}

export function MultipleChoiceQuestion({
  question,
  options,
  selected,
  onSelect,
}: MultipleChoiceQuestionProps) {
  return (
    <div className="mx-auto w-full max-w-[480px] px-6">
      <h2 className="text-xl font-normal leading-snug text-[#F0EDE8] md:text-2xl">
        {question}
      </h2>
      <ul className="mt-8 flex flex-col gap-3">
        {options.map((opt, index) => {
          const isSelected = selected === index;
          return (
            <li key={index}>
              <button
                type="button"
                onClick={() => onSelect(index)}
                className={
                  "w-full rounded-xl border px-4 py-4 text-left text-base leading-relaxed transition-colors duration-200 " +
                  (isSelected
                    ? "border-[#22D3EE] bg-[rgba(34,211,238,0.08)] text-[#F0EDE8]"
                    : "border-[rgba(240,237,232,0.1)] bg-transparent text-[#F0EDE8]")
                }
              >
                {opt}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
