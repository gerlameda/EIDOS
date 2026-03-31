"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ModuleProgress } from "@/components/modulo03/ModuleProgress";
import { SprintEditor } from "@/components/modulo03/SprintEditor";
import { calculateCriticalHabits } from "@/lib/modulo02/critical-habits";
import { generateSprintProposals } from "@/lib/modulo03/sprint";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { SprintCommitment } from "@/types/modulo03";

export default function Modulo03SprintPage() {
  const router = useRouter();
  const rutinaBase = useOnboardingStore((s) => s.rutinaBase);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const criticalHabits = useOnboardingStore((s) => s.criticalHabits);
  const saveSprintCommitment = useOnboardingStore((s) => s.saveSprintCommitment);
  const completeModulo03 = useOnboardingStore((s) => s.completeModulo03);

  const [edited, setEdited] = useState<SprintCommitment[] | null>(null);
  const [showErrors, setShowErrors] = useState(false);

  useEffect(() => {
    if (!rutinaBase) {
      router.replace("/modulo03/sistema");
    }
  }, [rutinaBase, router]);

  const habits = useMemo(() => {
    if (criticalHabits.length >= 3) return criticalHabits;
    if (visionAreas.length >= 5) return calculateCriticalHabits(visionAreas);
    return [];
  }, [criticalHabits, visionAreas]);

  const proposals = useMemo(() => {
    if (!rutinaBase || habits.length < 3 || visionAreas.length < 5) return [];
    return generateSprintProposals(habits, rutinaBase, visionAreas);
  }, [habits, rutinaBase, visionAreas]);

  const commitments = edited ?? proposals;

  const invalid = useMemo(
    () =>
      commitments.length !== 3 ||
      commitments.some(
        (c) => c.days.length === 0 || c.commitment.trim().length === 0,
      ),
    [commitments],
  );

  const handleConfirm = () => {
    if (invalid) {
      setShowErrors(true);
      return;
    }
    setShowErrors(false);
    for (const c of commitments) {
      saveSprintCommitment(c);
    }
    completeModulo03();
    router.push("/modulo03/cierre");
  };

  if (!rutinaBase || proposals.length !== 3) {
    return null;
  }

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-8 text-[#F0EDE8] md:px-8">
      <div className="mx-auto w-full max-w-lg pb-28">
        <ModuleProgress
          currentStep={3}
          stepLabel="Paso 3 de 3 · Tu Sprint"
        />
        <div className="my-8 border-t border-[#2A2A3A]" />

        <header className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#F0EDE8]">
            Tu primer sprint.
          </h1>
          <p className="text-sm leading-relaxed text-[rgba(240,237,232,0.6)]">
            7 días. 3 compromisos. Empieza el lunes.
          </p>
        </header>

        <div className="my-8 border-t border-[#2A2A3A]" />

        <SprintEditor
          value={commitments}
          onChange={setEdited}
          showErrors={showErrors}
        />
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t border-[#2A2A3A] bg-[#0D0D14]/95 px-6 py-4 backdrop-blur md:px-8">
        <div className="mx-auto w-full max-w-lg">
          <button
            type="button"
            onClick={handleConfirm}
            className="w-full rounded-xl border border-accent-gold bg-accent-gold/15 py-3.5 font-medium text-accent-gold transition-colors duration-200 hover:bg-accent-gold/25"
          >
            Confirmar mi sprint →
          </button>
        </div>
      </div>
    </main>
  );
}
