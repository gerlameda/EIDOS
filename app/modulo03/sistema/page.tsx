"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModuleProgress } from "@/components/modulo03/ModuleProgress";
import { RutinaBuilder } from "@/components/modulo03/RutinaBuilder";
import { calculateCriticalHabits } from "@/lib/modulo02/critical-habits";
import { generateRutinaBase } from "@/lib/modulo03/rutina";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { RutinaBase } from "@/types/modulo03";

export default function Modulo03SistemaPage() {
  const router = useRouter();
  const manifiesto = useOnboardingStore((s) => s.manifiesto);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const criticalHabits = useOnboardingStore((s) => s.criticalHabits);
  const saveRutinaBase = useOnboardingStore((s) => s.saveRutinaBase);

  useEffect(() => {
    if (!manifiesto) {
      router.replace("/modulo03/porque");
    }
  }, [manifiesto, router]);

  const habits = useMemo(() => {
    if (criticalHabits.length >= 3) return criticalHabits;
    if (visionAreas.length >= 5) return calculateCriticalHabits(visionAreas);
    return [];
  }, [criticalHabits, visionAreas]);

  const generated = useMemo(
    () => (habits.length >= 3 ? generateRutinaBase(habits) : null),
    [habits],
  );

  const [rutina, setRutina] = useState<RutinaBase | null>(null);
  const onRutina = useCallback((r: RutinaBase) => {
    setRutina(r);
  }, []);

  const handleContinue = () => {
    const toSave = rutina ?? generated;
    if (!toSave) return;
    saveRutinaBase(toSave);
    router.push("/modulo03/sprint");
  };

  if (!manifiesto || habits.length < 3 || !generated) return null;

  const rutinaBuilderKey = [
    generated.manana.habits.join(","),
    generated.tarde.habits.join(","),
    generated.noche.habits.join(","),
  ].join("|");

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-8 text-[#F0EDE8] md:px-8">
      <div className="mx-auto w-full max-w-lg pb-28">
        <ModuleProgress
          currentStep={2}
          stepLabel="Paso 2 de 3 · Tu Sistema"
        />
        <div className="my-8 border-t border-[#2A2A3A]" />

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#F0EDE8]">
            Tu rutina base.
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(240,237,232,0.6)]">
            Los 3 hábitos de tu ruta crítica, distribuidos en tu día. Ajusta los
            bloques si no te cuadran.
          </p>
        </header>

        <div className="my-8 border-t border-[#2A2A3A]" />

        <RutinaBuilder
          key={rutinaBuilderKey}
          criticalHabits={habits}
          initialRutina={generated}
          onChange={onRutina}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#2A2A3A] bg-[#0D0D14]/95 px-6 py-4 backdrop-blur md:px-8">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleContinue}
            className="w-full rounded-xl border border-accent-gold bg-accent-gold/15 py-3.5 font-medium text-accent-gold transition-colors duration-200 hover:bg-accent-gold/25"
          >
            Mi sistema está listo →
          </button>
        </div>
      </div>
    </main>
  );
}
