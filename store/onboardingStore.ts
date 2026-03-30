"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";

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
  capa2Areas: Capa2AreaStatus[];
  setStep: (step: number) => void;
  setNombre: (nombre: string) => void;
  setNivel: (nivel: number) => void;
  setAreaPrioritaria: (area: string) => void;
  setCapa1Saved: (saved: (Capa1AreaAnswer | null)[]) => void;
  setCapa2Areas: (areas: Capa2AreaStatus[]) => void;
  updateCapa2Area: (updated: Capa2AreaStatus) => void;
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
      capa2Areas: [],
      setStep: (step) => set({ step }),
      setNombre: (nombre) =>
        set({ nombre: normalizeNombreUsuario(nombre) }),
      setNivel: (nivel) => set({ nivel: clampNivel(nivel) }),
      setAreaPrioritaria: (area) => set({ areaPrioritaria: area }),
      setCapa1Saved: (saved) => set({ capa1Saved: saved }),
      setCapa2Areas: (areas) => set({ capa2Areas: areas }),
      updateCapa2Area: (updated) =>
        set((state) => {
          const exists = state.capa2Areas.find((a) => a.areaId === updated.areaId);
          if (exists) {
            return {
              capa2Areas: state.capa2Areas.map((a) =>
                a.areaId === updated.areaId ? updated : a,
              ),
            };
          }
          return { capa2Areas: [...state.capa2Areas, updated] };
        }),
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
          capa2Areas: Array.isArray(p.capa2Areas)
            ? p.capa2Areas
            : currentState.capa2Areas,
        };
      },
      partialize: (state) => ({
        nombre: state.nombre,
        nivel: state.nivel,
        areaPrioritaria: state.areaPrioritaria,
        capa1Saved: state.capa1Saved,
        capa2Areas: state.capa2Areas,
      }),
    },
  ),
);
