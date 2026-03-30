"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";

const CAPA1_SLOT_COUNT = 5;

function emptyCapa1Saved(): (Capa1AreaAnswer | null)[] {
  return Array.from({ length: CAPA1_SLOT_COUNT }, () => null);
}

export type OnboardingNivel = 1 | 2 | 3 | 4 | 5;

export interface OnboardingStore {
  step: number;
  nombre: string;
  nivel: OnboardingNivel;
  areaPrioritaria: string;
  /** Respuestas Capa 1 (5 áreas); `null` = omitida. Persistido en sessionStorage. */
  capa1Saved: (Capa1AreaAnswer | null)[];
  setStep: (step: number) => void;
  setNombre: (nombre: string) => void;
  setNivel: (nivel: number) => void;
  setAreaPrioritaria: (area: string) => void;
  setCapa1Saved: (saved: (Capa1AreaAnswer | null)[]) => void;
}

const clampNivel = (n: number): OnboardingNivel => {
  const x = Math.round(n);
  if (x < 1) return 1;
  if (x > 5) return 5;
  return x as OnboardingNivel;
};

/** "jOE"/"JOE" → "Joe" — usar siempre al persistir nombre. */
export function normalizeNombreUsuario(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      nombre: "",
      nivel: 1,
      areaPrioritaria: "",
      capa1Saved: emptyCapa1Saved(),
      setStep: (step) => set({ step }),
      setNombre: (nombre) =>
        set({ nombre: normalizeNombreUsuario(nombre) }),
      setNivel: (nivel) => set({ nivel: clampNivel(nivel) }),
      setAreaPrioritaria: (area) => set({ areaPrioritaria: area }),
      setCapa1Saved: (saved) => set({ capa1Saved: saved }),
    }),
    {
      name: "eidos-onboarding",
      storage: createJSONStorage(() => sessionStorage),
      merge: (persistedState, currentState) => {
        const p = persistedState as Partial<OnboardingStore>;
        return {
          ...currentState,
          ...p,
          capa1Saved:
            Array.isArray(p.capa1Saved) &&
            p.capa1Saved.length === CAPA1_SLOT_COUNT
              ? p.capa1Saved
              : currentState.capa1Saved,
        };
      },
      partialize: (state) => ({
        nombre: state.nombre,
        nivel: state.nivel,
        areaPrioritaria: state.areaPrioritaria,
        capa1Saved: state.capa1Saved,
      }),
    },
  ),
);
