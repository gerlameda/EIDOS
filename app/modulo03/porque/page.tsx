"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ManifiestoEditor } from "@/components/modulo03/ManifiestoEditor";
import { ModuleProgress } from "@/components/modulo03/ModuleProgress";
import { calculateCriticalHabits } from "@/lib/modulo02/critical-habits";
import { generateManifiestoProposal } from "@/lib/modulo03/manifiesto";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { Manifiesto } from "@/types/modulo03";

export default function Modulo03PorquePage() {
  const router = useRouter();
  const nombre = useOnboardingStore((s) => s.nombre);
  const nivel = useOnboardingStore((s) => s.nivel);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const criticalHabits = useOnboardingStore((s) => s.criticalHabits);
  const saveManifiesto = useOnboardingStore((s) => s.saveManifiesto);

  const [lines, setLines] = useState<[string, string, string] | undefined>(
    undefined,
  );
  const [showCards, setShowCards] = useState(false);

  useEffect(() => {
    if (visionAreas.length < 5) {
      router.replace("/modulo02/areas/salud");
    }
  }, [router, visionAreas.length]);

  const habits = useMemo(() => {
    if (criticalHabits.length >= 3) return criticalHabits;
    if (visionAreas.length >= 5) return calculateCriticalHabits(visionAreas);
    return [];
  }, [criticalHabits, visionAreas]);

  const proposal = useMemo(() => {
    if (habits.length < 3 || visionAreas.length < 5) return null;
    return generateManifiestoProposal(nombre, nivel, visionAreas, habits);
  }, [nombre, nivel, visionAreas, habits]);

  const workingLines = lines ?? proposal?.lines;

  useEffect(() => {
    const t = setTimeout(() => setShowCards(true), 40);
    return () => clearTimeout(t);
  }, []);

  const onLinesChange = useCallback((l: [string, string, string]) => {
    setLines(l);
  }, []);

  const canContinue =
    !!workingLines && workingLines.every((line) => line.trim().length > 0);

  const handleContinue = () => {
    if (!workingLines || !canContinue) return;
    const payload: Manifiesto = {
      lines: workingLines,
      createdAt: new Date().toISOString(),
    };
    saveManifiesto(payload);
    router.push("/modulo03/sistema");
  };

  if (visionAreas.length < 5 || !proposal || !workingLines) return null;

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-8 text-[#F0EDE8] md:px-8">
      <div className="mx-auto w-full max-w-lg pb-28">
        <ModuleProgress
          currentStep={1}
          stepLabel="Paso 1 de 3 · Tu Por Qué"
        />
        <div className="my-8 border-t border-[#2A2A3A]" />

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#F0EDE8]">
            ¿Por qué hace todo esto?
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(240,237,232,0.6)]">
            Tres líneas. Tu identidad, tu dirección, tu compromiso. El sistema
            las propone — tú las haces tuyas.
          </p>
        </header>

        <div className="my-8 border-t border-[#2A2A3A]" />

        <div
          className={
            "transition-all duration-500 " +
            (showCards ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
        >
          <ManifiestoEditor
            key={proposal.createdAt}
            initialLines={workingLines}
            onChange={onLinesChange}
          />
        </div>

        <p className="mt-6 text-center text-sm italic text-[rgba(240,237,232,0.6)]">
          Estas líneas son tuyas — edítalas hasta que suenen a ti.
        </p>
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#2A2A3A] bg-[#0D0D14]/95 px-6 py-4 backdrop-blur md:px-8">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!canContinue}
            className={
              "w-full rounded-xl border border-accent-gold bg-accent-gold/15 py-3.5 font-medium text-accent-gold transition-all duration-200 " +
              (canContinue
                ? "hover:bg-accent-gold/25"
                : "cursor-not-allowed opacity-40")
            }
          >
            Mi manifiesto está listo →
          </button>
        </div>
      </div>
    </main>
  );
}
