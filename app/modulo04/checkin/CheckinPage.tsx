"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { selectReflectionQuestion } from "@/lib/modulo04/checkinContext";
import { upsertCheckin } from "@/lib/supabase/checkin";
import { useBossStore } from "@/store/bossStore";
import { useDailyStore } from "@/store/dailyStore";
import type { CheckinStep } from "@/types/modulo04";

interface CheckinPageProps {
  userId: string;
  todayDate: string;
  alreadyClosed: boolean;
}

export default function CheckinPage({
  userId,
  todayDate,
  alreadyClosed,
}: CheckinPageProps) {
  const {
    missions,
    sleepOk,
    setSleepOk,
    foodOk,
    setFoodOk,
    reflectionAnswer,
    setReflectionAnswer,
    checkinClosed,
    setCheckinClosed,
  } = useDailyStore();
  const { activeBoss, streakDays, incrementStreak } = useBossStore();

  const completedMissions = missions.filter((m) => m.markedAt !== null);
  const completedCoreToday = completedMissions.some((m) => m.isCore);

  const reflectionQuestion = useMemo(
    () =>
      selectReflectionQuestion({
        bossPhase: activeBoss?.phase ?? "intimidando",
        missionsCompleted: completedMissions.length,
        totalMissions: missions.length,
        streakDays,
        sleepOk,
        completedCoreToday,
      }),
    [
      activeBoss?.phase,
      completedMissions.length,
      missions.length,
      streakDays,
      sleepOk,
      completedCoreToday,
    ],
  );

  const [step, setStep] = useState<CheckinStep>(alreadyClosed ? "summary" : 1);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (alreadyClosed) {
      setCheckinClosed(true);
    }
  }, [alreadyClosed, setCheckinClosed]);

  const totalDamage = completedMissions.reduce(
    (sum, m) => sum + m.damageAmount,
    0,
  );
  const completedKeys = completedMissions.map((m) => m.key);

  async function handleFinish() {
    setSaving(true);
    try {
      await upsertCheckin(userId, {
        date: todayDate,
        habitsCompleted: completedKeys,
        sleepOk,
        foodOk,
        reflectionQuestion,
        reflectionAnswer: reflectionAnswer || null,
      });
      incrementStreak();
      setCheckinClosed(true);
      setStep("summary");
    } finally {
      setSaving(false);
    }
  }

  if (step === "summary" || checkinClosed) {
    return (
      <main className="min-h-screen bg-[#0D0D14] px-5 py-8 text-[#F0EDE8]">
        <div className="mx-auto w-full max-w-lg space-y-6">
          <h1 className="text-lg font-bold">Tu día</h1>
          <div className="space-y-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5">
            <p className="text-sm text-[#F0EDE8]">
              Completaste{" "}
              <span className="font-bold text-[#22D3EE]">
                {completedMissions.length}
              </span>{" "}
              de {missions.length} misiones.
            </p>
            {totalDamage > 0 && (
              <p className="text-sm font-bold text-[#22D3EE]">
                El boss perdió {totalDamage} HP.
              </p>
            )}
            <p className="text-sm text-[rgba(240,237,232,0.6)]">
              {sleepOk
                ? "Dormiste bien — eso cuenta."
                : "El descanso también es parte del juego."}
            </p>
            <p className="text-xs text-[rgba(240,237,232,0.4)]">
              Mañana tienes otra oportunidad.
            </p>
          </div>
          <Link
            href="/modulo04/journal"
            className="block w-full rounded-xl bg-[#22D3EE] py-3 text-center text-sm font-bold text-[#0D0D14]"
          >
            Escribir en el journal →
          </Link>
          <Link
            href="/modulo04"
            className="block text-center text-xs text-[rgba(240,237,232,0.5)] underline"
          >
            ← Volver al campo base
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#0D0D14] px-5 py-8 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Progress */}
        <div className="flex items-center justify-between">
          <Link
            href="/modulo04"
            className="text-xs text-[rgba(240,237,232,0.5)]"
          >
            ← Campo base
          </Link>
          <p className="text-xs text-[rgba(240,237,232,0.5)]">
            PASO {step} DE 3
          </p>
        </div>

        {/* Paso 1 — ¿Qué completaste? */}
        {step === 1 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold">¿Qué completaste hoy?</h2>
            <ul className="space-y-2">
              {missions.map((mission) => (
                <li
                  key={mission.key}
                  className="flex items-center justify-between rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3"
                >
                  <p className="text-sm text-[#F0EDE8]">{mission.habitText}</p>
                  {mission.markedAt ? (
                    <span className="text-xs text-[rgba(240,237,232,0.4)]">
                      ya registrado
                    </span>
                  ) : (
                    <span className="text-xs text-[rgba(240,237,232,0.3)]">
                      ○
                    </span>
                  )}
                </li>
              ))}
            </ul>
            <button
              type="button"
              onClick={() => setStep(2)}
              className="w-full rounded-xl bg-[#22D3EE] py-3 text-sm font-bold text-[#0D0D14]"
            >
              Continuar →
            </button>
          </section>
        )}

        {/* Paso 2 — ¿Cómo estuviste? */}
        {step === 2 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold">¿Cómo estuviste?</h2>
            <div className="grid grid-cols-2 gap-3">
              {/* Sueño */}
              <div className="space-y-2 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-4">
                <p className="text-center text-sm">😴 Sueño</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSleepOk(true)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${sleepOk ? "bg-[#22D3EE] text-[#0D0D14]" : "bg-[#2A2A3A] text-[#F0EDE8]"}`}
                  >
                    Bien
                  </button>
                  <button
                    type="button"
                    onClick={() => setSleepOk(false)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${!sleepOk ? "bg-[#C9A84C] text-[#0D0D14]" : "bg-[#2A2A3A] text-[#F0EDE8]"}`}
                  >
                    Mal
                  </button>
                </div>
              </div>
              {/* Comida */}
              <div className="space-y-2 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-4">
                <p className="text-center text-sm">🍎 Comida</p>
                <div className="flex justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setFoodOk(true)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${foodOk ? "bg-[#22D3EE] text-[#0D0D14]" : "bg-[#2A2A3A] text-[#F0EDE8]"}`}
                  >
                    Bien
                  </button>
                  <button
                    type="button"
                    onClick={() => setFoodOk(false)}
                    className={`rounded-lg px-3 py-1 text-xs font-bold ${!foodOk ? "bg-[#C9A84C] text-[#0D0D14]" : "bg-[#2A2A3A] text-[#F0EDE8]"}`}
                  >
                    Mal
                  </button>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setStep(3)}
              className="w-full rounded-xl bg-[#22D3EE] py-3 text-sm font-bold text-[#0D0D14]"
            >
              Continuar →
            </button>
          </section>
        )}

        {/* Paso 3 — Reflexión */}
        {step === 3 && (
          <section className="space-y-4">
            <h2 className="text-base font-bold">Reflexión del día</h2>
            <p className="text-sm italic text-[rgba(240,237,232,0.7)]">
              {`"${reflectionQuestion}"`}
            </p>
            <textarea
              value={reflectionAnswer}
              onChange={(e) => setReflectionAnswer(e.target.value)}
              placeholder="Escribe aquí..."
              rows={4}
              className="w-full rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
            <button
              type="button"
              onClick={() => void handleFinish()}
              disabled={saving}
              className="w-full rounded-xl bg-[#C9A84C] py-3 text-sm font-bold text-[#0D0D14] disabled:opacity-50"
            >
              {saving ? "Guardando..." : "Cerrar mi día →"}
            </button>
          </section>
        )}
      </div>
    </main>
  );
}
