"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

const AREAS = [
  "Personal / Mental",
  "Física / Salud",
  "Financiera",
  "Profesional / Académica",
  "Social / Relaciones",
] as const;

export function Step8Mision() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();
  const setArea = useOnboardingStore((s) => s.setAreaPrioritaria);
  const [picked, setPicked] = useState<string | null>(null);

  const empezar = useCallback(() => {
    if (!picked) return;
    setArea(picked);
    router.push("/dashboard");
  }, [picked, setArea, router]);

  useEffect(() => {
    setHandlers({
      canGoNext: () => picked != null,
      goNext: empezar,
    });
    return () => setHandlers(null);
  }, [setHandlers, picked, empezar]);

  return (
    <div className="flex flex-1 flex-col justify-center pb-8">
      <div className="mx-auto w-full max-w-lg">
        <div className="space-y-2 text-center md:text-left">
          <p className="text-xl text-text-primary md:text-2xl">
            Si tu vida fuera un juego,
          </p>
          <p className="text-xl text-text-primary md:text-2xl">
            ¿en qué área estarías ganando ahora mismo?
          </p>
        </div>

        <div className="mt-10 space-y-3" role="radiogroup">
          {AREAS.map((area) => {
            const sel = picked === area;
            return (
              <label
                key={area}
                className={`flex cursor-pointer items-center gap-3 rounded-xl border px-4 py-4 transition-all duration-[400ms] ease-in-out ${
                  sel
                    ? "border-accent-gold bg-accent-gold/10"
                    : "border-text-muted/30 hover:border-text-muted/60"
                }`}
              >
                <input
                  type="radio"
                  name="area"
                  checked={sel}
                  onChange={() => setPicked(area)}
                  className="size-4 accent-[#C9A84C]"
                />
                <span className="text-text-primary">{area}</span>
              </label>
            );
          })}
        </div>

        {picked ? (
          <p className="mt-8 text-center text-lg text-text-primary md:text-left">
            Esa es tu base. Construimos desde ahí.
          </p>
        ) : null}

        <button
          type="button"
          onClick={empezar}
          disabled={!picked}
          className="mt-10 w-full rounded-lg border border-accent-gold py-3 font-medium text-accent-gold transition-colors hover:bg-accent-gold/10 disabled:opacity-40"
        >
          Empezar mi juego →
        </button>
      </div>
    </div>
  );
}
