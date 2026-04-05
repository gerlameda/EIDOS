"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { HabitCard } from "@/components/modulo02/HabitCard";
import { getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import {
  AREA_LABELS,
  AREA_ORDER,
  MODULO01_AREA_ID_BY_MODULO02,
} from "@/lib/modulo02/areas";
import { calculateCriticalHabits } from "@/lib/modulo02/critical-habits";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function Modulo02CierrePage() {
  const router = useRouter();
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const capa2Areas = useOnboardingStore((s) => s.capa2Areas);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const criticalHabits = useOnboardingStore((s) => s.criticalHabits);
  const setCriticalHabits = useOnboardingStore((s) => s.setCriticalHabits);

  const [show, setShow] = useState(false);

  const firstIncomplete =
    AREA_ORDER.find((area) => !visionAreas.some((v) => v.area === area)) ?? null;

  useEffect(() => {
    if (firstIncomplete) {
      router.replace(`/modulo02/areas/${firstIncomplete}`);
    }
  }, [firstIncomplete, router]);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (visionAreas.length < 5) return;
    const habits = calculateCriticalHabits(visionAreas);
    setCriticalHabits(habits);
    void syncProfileToSupabase(useOnboardingStore.getState());
  }, [setCriticalHabits, visionAreas]);

  const scores = useMemo(
    () => getUnifiedAreaScores(capa1Saved, capa2Areas),
    [capa1Saved, capa2Areas],
  );

  if (firstIncomplete) return null;

  const habitsToShow =
    criticalHabits.length === 3
      ? criticalHabits
      : calculateCriticalHabits(visionAreas).slice(0, 3);

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-10 text-text-primary md:px-8">
      <div className="mx-auto w-full max-w-3xl space-y-10">
        <section
          data-animate="true"
          className={
            "space-y-3 transition-all duration-500 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent-cyan">
            Tu visión de vida
          </p>
          <h1 className="text-4xl font-semibold text-accent-gold">El mapa está trazado.</h1>
          <p className="text-base text-text-muted">
            Aquí está hacia dónde vas — área por área.
          </p>
        </section>

        <div className="border-t border-white/10" />

        <section className="space-y-4">
          {AREA_ORDER.map((area, i) => {
            const vision = visionAreas.find((v) => v.area === area);
            const score = scores.find(
              (s) => s.areaId === MODULO01_AREA_ID_BY_MODULO02[area],
            )?.score;
            if (!vision) return null;
            return (
              <article
                key={area}
                data-animate="true"
                className={
                  "rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-all duration-500 " +
                  (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
                }
                style={{ transitionDelay: `${i * 200}ms` }}
              >
                <p className="text-xs uppercase tracking-wide text-accent-cyan">
                  {AREA_LABELS[area]}
                </p>
                <p className="mt-1 text-xs uppercase tracking-wide text-accent-gold/90">
                  {vision.horizon}
                </p>
                <p className="mt-3 text-base text-text-primary">{vision.statement}</p>
                <p className="mt-3 text-xs text-text-muted">
                  Punto de partida: {score ?? 0}
                </p>
              </article>
            );
          })}

          <button
            type="button"
            onClick={() => router.push("/modulo02/areas/salud")}
            className="text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            ← Editar mi visión
          </button>
        </section>

        <div className="border-t border-white/10" />

        <section
          data-animate="true"
          className={
            "space-y-4 transition-all duration-500 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
          style={{ transitionDelay: "800ms" }}
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent-cyan">
            Ruta crítica
          </p>
          <h2 className="text-2xl font-semibold text-text-primary">
            3 hábitos que mueven todo.
          </h2>
          <p className="text-sm text-text-muted">
            Calculados a partir de tu brecha y tu horizonte.
          </p>

          <div className="space-y-3">
            {habitsToShow.map((habit) => (
              <HabitCard key={`${habit.priority}-${habit.area}`} habit={habit} />
            ))}
          </div>
        </section>

        <div className="border-t border-white/10" />

        <section className="space-y-3 pb-6">
          <Link
            href="/modulo03"
            className="block w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 text-center font-medium text-accent-cyan transition-colors duration-200 hover:bg-accent-cyan/20"
          >
            Comenzar Módulo 03 →
          </Link>
          <button
            type="button"
            onClick={() => window.alert("Perfil guardado localmente por ahora.")}
            className="w-full rounded-lg border border-white/15 py-3.5 text-center text-sm text-text-muted transition-colors duration-200 hover:text-text-primary"
          >
            Guardar mi perfil
          </button>
        </section>
      </div>
    </main>
  );
}

