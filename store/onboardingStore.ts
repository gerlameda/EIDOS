import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type OnboardingNivel = 1 | 2 | 3 | 4 | 5;

export interface OnboardingStore {
  step: number;
  nombre: string;
  nivel: OnboardingNivel;
  areaPrioritaria: string;
  setStep: (step: number) => void;
  setNombre: (nombre: string) => void;
  setNivel: (nivel: number) => void;
  setAreaPrioritaria: (area: string) => void;
}

const clampNivel = (n: number): OnboardingNivel => {
  const x = Math.round(n);
  if (x < 1) return 1;
  if (x > 5) return 5;
  return x as OnboardingNivel;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      nombre: "",
      nivel: 1,
      areaPrioritaria: "",
      setStep: (step) => set({ step }),
      setNombre: (nombre) => set({ nombre }),
      setNivel: (nivel) => set({ nivel: clampNivel(nivel) }),
      setAreaPrioritaria: (area) => set({ areaPrioritaria: area }),
    }),
    {
      name: "eidos-onboarding",
      storage: createJSONStorage(() => sessionStorage),
      partialize: (state) => ({
        nombre: state.nombre,
        nivel: state.nivel,
        areaPrioritaria: state.areaPrioritaria,
      }),
    },
  ),
);
