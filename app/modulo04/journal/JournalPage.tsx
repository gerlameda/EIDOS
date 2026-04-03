"use client";

import { useState } from "react";
import { saveJournalAction } from "../actions";
import { useBossStore } from "@/store/bossStore";
import type { JournalEntry } from "@/types/modulo04";

interface JournalPageProps {
  todayDate: string;
  todayEntry: JournalEntry | null;
  archive: JournalEntry[];
  weeklyPattern: string | null;
  bossId: string | null;
}

export default function JournalPage({
  todayDate,
  todayEntry,
  archive,
  weeklyPattern,
  bossId,
}: JournalPageProps) {
  const { streakDays } = useBossStore();

  const [content, setContent] = useState(todayEntry?.content ?? "");
  const [oneWord, setOneWord] = useState(todayEntry?.oneWord ?? "");
  const [intention, setIntention] = useState(
    todayEntry?.intentionTomorrow ?? "",
  );
  const [saved, setSaved] = useState(todayEntry !== null);
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      const ok = await saveJournalAction({
        date: todayDate,
        content: content || null,
        oneWord: oneWord || null,
        intentionTomorrow: intention || null,
        bossId,
        streakDay: streakDays,
      });
      if (ok) setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-5 py-6 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-8">
        <p className="text-xs uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
          {todayDate}
        </p>

        {/* Entrada del día */}
        <section className="space-y-4">
          <textarea
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setSaved(false);
            }}
            placeholder="Sin filtro. ¿Qué pasó hoy? Actuaste desde ti. ¿Qué patrón viste?"
            rows={5}
            className="w-full rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
          />

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Una palabra
            </label>
            <input
              type="text"
              value={oneWord}
              onChange={(e) => {
                setOneWord(e.target.value);
                setSaved(false);
              }}
              placeholder="ej. enfocado"
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Intención mañana
            </label>
            <input
              type="text"
              value={intention}
              onChange={(e) => {
                setIntention(e.target.value);
                setSaved(false);
              }}
              placeholder="ej. deep work 3h antes del mediodía"
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
          </div>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving}
            className="w-full rounded-xl bg-[#22D3EE] py-3 text-sm font-bold text-[#0D0D14] disabled:opacity-50"
          >
            {saving
              ? "Guardando..."
              : saved
                ? "✓ Guardado"
                : "Guardar entrada →"}
          </button>
        </section>

        {/* Patrón de la semana */}
        {weeklyPattern && (
          <section className="space-y-1 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-4">
            <p className="text-xs font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Patrón detectado
            </p>
            <p className="text-sm text-[#F0EDE8]">
              Tu palabra más frecuente esta semana:{" "}
              <span className="font-bold text-[#22D3EE]">{weeklyPattern}</span>
            </p>
          </section>
        )}

        {/* Archivo */}
        {archive.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Entradas anteriores
            </h2>
            <ul className="space-y-2">
              {archive.map((entry) => (
                <li
                  key={entry.id}
                  className="space-y-1 rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-[rgba(240,237,232,0.5)]">
                      {entry.date}
                    </p>
                    {entry.oneWord && (
                      <span className="text-xs font-bold text-[#22D3EE]">
                        {entry.oneWord}
                      </span>
                    )}
                  </div>
                  {entry.content && (
                    <p className="line-clamp-2 text-xs text-[rgba(240,237,232,0.6)]">
                      {entry.content}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
