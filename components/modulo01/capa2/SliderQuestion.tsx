"use client";

import { useId } from "react";

export interface SliderQuestionProps {
  question: string;
  leftLabel: string;
  rightLabel: string;
  value: number; // 0–100
  onChange: (value: number) => void;
}

export function SliderQuestion({
  question,
  leftLabel,
  rightLabel,
  value,
  onChange,
}: SliderQuestionProps) {
  const uid = useId().replace(/:/g, "");
  const v = Math.min(100, Math.max(0, value));
  const webkitTrackBg = `linear-gradient(to right, #22D3EE 0%, #22D3EE ${v}%, rgba(240,237,232,0.15) ${v}%, rgba(240,237,232,0.15) 100%)`;

  return (
    <div className="mx-auto w-full max-w-[480px] px-6">
      <style>{`
        #capa2-range-${uid}::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 9999px;
          background: ${webkitTrackBg};
        }
        #capa2-range-${uid}::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: rgba(240, 237, 232, 0.15);
        }
        #capa2-range-${uid}::-moz-range-progress {
          height: 8px;
          border-radius: 9999px;
          background: #22d3ee;
        }
      `}</style>
      <h2 className="text-xl font-normal leading-snug text-[#F0EDE8] md:text-2xl">
        {question}
      </h2>
      <p className="mt-6 text-center text-lg font-medium tabular-nums text-[#F0EDE8]">
        {v}%
      </p>
      <p className="mt-1 text-center text-xs text-[rgba(240,237,232,0.4)]">
        ← Desliza la barra para ajustar →
      </p>
      <div className="mt-3">
        <input
          id={`capa2-range-${uid}`}
          type="range"
          min={0}
          max={100}
          value={v}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-[#22D3EE] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0D0D14] [&::-moz-range-thumb]:bg-[#22D3EE] [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0D0D14] [&::-webkit-slider-thumb]:bg-[#22D3EE] [&::-webkit-slider-thumb]:shadow-sm"
        />
      </div>
      <div className="mt-3 flex justify-between gap-4 text-xs leading-snug text-[rgba(240,237,232,0.5)] sm:text-sm">
        <span className="max-w-[42%] text-left">{leftLabel}</span>
        <span className="max-w-[42%] text-right">{rightLabel}</span>
      </div>
    </div>
  );
}
