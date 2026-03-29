"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { OnboardingNivel } from "@/store/onboardingStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

const OPCIONES: { id: OnboardingNivel; titulo: string; hint: string }[] = [
  {
    id: 1,
    titulo: "Despertando",
    hint: "apenas estoy cuestionando cómo vivo",
  },
  {
    id: 2,
    titulo: "Explorando",
    hint: "me conozco algo pero no tengo claridad total",
  },
  {
    id: 3,
    titulo: "Construyendo",
    hint: "tengo bases y estoy trabajando en mí",
  },
  {
    id: 4,
    titulo: "Dominando",
    hint: "soy consistente y vivo con intención",
  },
  {
    id: 5,
    titulo: "Final Boss",
    hint: "integré mi trabajo interno, vivo desde adentro",
  },
];

export function Step6Nivel() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();
  const setNivel = useOnboardingStore((s) => s.setNivel);
  const [picked, setPicked] = useState<OnboardingNivel | null>(null);

  const confirmar = useCallback(() => {
    if (picked == null) return;
    setNivel(picked);
    router.push("/onboarding/7");
  }, [picked, setNivel, router]);

  useEffect(() => {
    setHandlers({
      canGoNext: () => picked != null,
      goNext: confirmar,
    });
    return () => setHandlers(null);
  }, [setHandlers, picked, confirmar]);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-lg">
        <h1 className="text-center text-2xl font-semibold text-text-primary md:text-left md:text-3xl">
          ¿En qué punto estás en tu camino de autoconocimiento?
        </h1>

        <div className="mt-10 space-y-3" role="radiogroup">
          {OPCIONES.map((op) => {
            const sel = picked === op.id;
            return (
              <label
                key={op.id}
                className={`flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-4 transition-all duration-[400ms] ease-in-out ${
                  sel
                    ? "border-accent-cyan bg-accent-cyan/10"
                    : "border-text-muted/30 hover:border-text-muted/60"
                }`}
              >
                <input
                  type="radio"
                  name="nivel"
                  checked={sel}
                  onChange={() => setPicked(op.id)}
                  className="mt-1 size-4 accent-[#22D3EE]"
                />
                <span className="flex-1">
                  <span className="block font-medium text-text-primary">
                    {op.titulo}
                  </span>
                  <span className="block text-sm text-text-muted">{op.hint}</span>
                </span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          onClick={confirmar}
          disabled={picked == null}
          className="mt-10 w-full rounded-lg border border-accent-cyan py-3 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 disabled:opacity-40"
        >
          Este soy yo →
        </button>
      </div>
    </div>
  );
}
