"use client";

import { useEffect, useRef, useState } from "react";

export type ManifiestoEditorProps = {
  initialLines: [string, string, string];
  onChange: (lines: [string, string, string]) => void;
};

function AutoTextarea({
  value,
  onChange,
  id,
  "aria-label": ariaLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  id: string;
  "aria-label": string;
}) {
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.height = "0px";
    el.style.height = `${Math.max(el.scrollHeight, 120)}px`;
  }, [value]);
  return (
    <textarea
      id={id}
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={4}
      aria-label={ariaLabel}
      className="min-h-[120px] w-full resize-none rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-3 py-3 text-sm leading-relaxed text-[#F0EDE8] placeholder:text-[rgba(240,237,232,0.35)] focus:border-accent-cyan focus:outline-none focus:ring-1 focus:ring-accent-cyan"
    />
  );
}

export function ManifiestoEditor({
  initialLines,
  onChange,
}: ManifiestoEditorProps) {
  const [lines, setLines] = useState<[string, string, string]>(initialLines);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    onChangeRef.current(lines);
  }, [lines]);

  const patch = (i: 0 | 1 | 2, v: string) => {
    setLines((prev) =>
      i === 0 ? [v, prev[1], prev[2]] : i === 1 ? [prev[0], v, prev[2]] : [prev[0], prev[1], v],
    );
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2 rounded-xl border border-[#2A2A3A] bg-[#0D0D14]/40 p-4 transition-all duration-500">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-cyan">
          Identidad
        </p>
        <AutoTextarea
          id="manifiesto-l1"
          aria-label="Línea de identidad"
          value={lines[0]}
          onChange={(v) => patch(0, v)}
        />
      </div>
      <div className="space-y-2 rounded-xl border border-[#2A2A3A] bg-[#0D0D14]/40 p-4 transition-all duration-500 delay-100">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-gold">
          Dirección
        </p>
        <AutoTextarea
          id="manifiesto-l2"
          aria-label="Línea de dirección"
          value={lines[1]}
          onChange={(v) => patch(1, v)}
        />
      </div>
      <div className="space-y-2 rounded-xl border border-[#2A2A3A] bg-[#0D0D14]/40 p-4 transition-all duration-500 delay-200">
        <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(240,237,232,0.6)]">
          Compromiso
        </p>
        <AutoTextarea
          id="manifiesto-l3"
          aria-label="Línea de compromiso"
          value={lines[2]}
          onChange={(v) => patch(2, v)}
        />
      </div>
    </div>
  );
}
