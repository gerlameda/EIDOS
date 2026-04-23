"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import { normalizeNombreUsuario } from "@/lib/onboarding/normalize";
import type { CriticalHabit, VisionArea } from "@/types/modulo02";
import type {
  Manifiesto,
  RutinaBase,
  SprintCommitment,
} from "@/types/modulo03";

const CAPA1_SLOT_COUNT = 5;

function emptyCapa1Saved(): (Capa1AreaAnswer | null)[] {
  return Array.from({ length: CAPA1_SLOT_COUNT }, () => null);
}

function isValidManifiesto(m: unknown): m is Manifiesto {
  if (!m || typeof m !== "object") return false;
  const o = m as Manifiesto;
  if (typeof o.createdAt !== "string") return false;
  if (!Array.isArray(o.lines) || o.lines.length !== 3) return false;
  return o.lines.every((l) => typeof l === "string");
}

function isValidRutinaBlock(b: unknown): b is {
  timeOfDay: string;
  habits: string[];
} {
  if (!b || typeof b !== "object") return false;
  const o = b as { timeOfDay?: unknown; habits?: unknown };
  return (
    typeof o.timeOfDay === "string" && Array.isArray(o.habits) &&
    o.habits.every((h) => typeof h === "string")
  );
}

function isValidRutinaBase(r: unknown): r is RutinaBase {
  if (!r || typeof r !== "object") return false;
  const o = r as RutinaBase;
  return (
    isValidRutinaBlock(o.manana) &&
    isValidRutinaBlock(o.tarde) &&
    isValidRutinaBlock(o.noche)
  );
}

function isValidSprintCommitment(c: unknown): c is SprintCommitment {
  if (!c || typeof c !== "object") return false;
  const o = c as SprintCommitment;
  const okP =
    o.habitPriority === 1 ||
    o.habitPriority === 2 ||
    o.habitPriority === 3;
  return (
    okP &&
    typeof o.area === "string" &&
    typeof o.habit === "string" &&
    typeof o.commitment === "string" &&
    Array.isArray(o.days) &&
    typeof o.timeOfDay === "string"
  );
}

export type OnboardingNivel = 1 | 2 | 3 | 4 | 5;

export interface OnboardingStore {
  step: number;
  nombre: string;
  nivel: OnboardingNivel;
  areaPrioritaria: string;
  /** Respuestas Capa 1 (5 áreas); `null` = omitida. Persistido en localStorage. */
  capa1Saved: (Capa1AreaAnswer | null)[];
  capa2Areas: Capa2AreaStatus[];
  visionAreas: VisionArea[];
  criticalHabits: CriticalHabit[];
  manifiesto: Manifiesto | null;
  rutinaBase: RutinaBase | null;
  sprintCommitments: SprintCommitment[];
  modulo03Completed: boolean;
  setStep: (step: number) => void;
  setNombre: (nombre: string) => void;
  setNivel: (nivel: number) => void;
  setAreaPrioritaria: (area: string) => void;
  setCapa1Saved: (saved: (Capa1AreaAnswer | null)[]) => void;
  setCapa2Areas: (areas: Capa2AreaStatus[]) => void;
  updateCapa2Area: (updated: Capa2AreaStatus) => void;
  saveVisionArea: (vision: VisionArea) => void;
  setCriticalHabits: (habits: CriticalHabit[]) => void;
  saveManifiesto: (manifiesto: Manifiesto) => void;
  saveRutinaBase: (rutina: RutinaBase) => void;
  saveSprintCommitment: (commitment: SprintCommitment) => void;
  completeModulo03: () => void;
  /** Reinicia el store a sus valores por defecto y limpia localStorage. */
  resetStore: () => void;
}

const clampNivel = (n: number): OnboardingNivel => {
  const x = Math.round(n);
  if (x < 1) return 1;
  if (x > 5) return 5;
  return x as OnboardingNivel;
};

// Re-export de la función pura viviendo en `lib/`. Mantener este re-export
// para no romper los imports existentes (`@/store/onboardingStore`), pero las
// Server Actions deben importar desde `@/lib/onboarding/normalize` para no
// arrastrar Zustand / React al bundle del servidor.
export { normalizeNombreUsuario } from "@/lib/onboarding/normalize";

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      step: 1,
      nombre: "",
      nivel: 1,
      areaPrioritaria: "",
      capa1Saved: emptyCapa1Saved(),
      capa2Areas: [],
      visionAreas: [],
      criticalHabits: [],
      manifiesto: null,
      rutinaBase: null,
      sprintCommitments: [],
      modulo03Completed: false,
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
      saveVisionArea: (vision) =>
        set((state) => {
          const exists = state.visionAreas.find((v) => v.area === vision.area);
          if (exists) {
            return {
              visionAreas: state.visionAreas.map((v) =>
                v.area === vision.area ? vision : v,
              ),
            };
          }
          return { visionAreas: [...state.visionAreas, vision] };
        }),
      setCriticalHabits: (habits) => set({ criticalHabits: habits }),
      saveManifiesto: (manifiesto) => set({ manifiesto }),
      saveRutinaBase: (rutina) => set({ rutinaBase: rutina }),
      saveSprintCommitment: (commitment) =>
        set((state) => {
          const others = state.sprintCommitments.filter(
            (c) => c.habitPriority !== commitment.habitPriority,
          );
          const sprintCommitments = [...others, commitment].sort(
            (a, b) => a.habitPriority - b.habitPriority,
          );
          return { sprintCommitments };
        }),
      completeModulo03: () => set({ modulo03Completed: true }),
      resetStore: () =>
        set({
          step: 1,
          nombre: "",
          nivel: 1,
          areaPrioritaria: "",
          capa1Saved: emptyCapa1Saved(),
          capa2Areas: [],
          visionAreas: [],
          criticalHabits: [],
          manifiesto: null,
          rutinaBase: null,
          sprintCommitments: [],
          modulo03Completed: false,
        }),
    }),
    {
      name: "eidos-onboarding",
      // IMPORTANTE: localStorage (no sessionStorage). El flujo de confirmación
      // de email abre una pestaña nueva; sessionStorage no viaja entre pestañas
      // y el store quedaba vacío, sobrescribiendo los datos del usuario con
      // defaults al hacer sync. Ver commit que introduce este cambio.
      storage: createJSONStorage(() =>
        typeof window !== "undefined" ? window.localStorage : sessionStorage,
      ),
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
          visionAreas: Array.isArray(p.visionAreas)
            ? p.visionAreas
            : currentState.visionAreas,
          criticalHabits: Array.isArray(p.criticalHabits)
            ? p.criticalHabits
            : currentState.criticalHabits,
          manifiesto:
            p.manifiesto === undefined
              ? currentState.manifiesto
              : p.manifiesto === null
                ? null
                : isValidManifiesto(p.manifiesto)
                  ? p.manifiesto
                  : currentState.manifiesto,
          rutinaBase:
            p.rutinaBase === undefined
              ? currentState.rutinaBase
              : p.rutinaBase === null
                ? null
                : isValidRutinaBase(p.rutinaBase)
                  ? p.rutinaBase
                  : currentState.rutinaBase,
          sprintCommitments:
            p.sprintCommitments === undefined
              ? currentState.sprintCommitments
              : Array.isArray(p.sprintCommitments) &&
                  p.sprintCommitments.every(isValidSprintCommitment)
                ? p.sprintCommitments
                : currentState.sprintCommitments,
          modulo03Completed:
            p.modulo03Completed === undefined
              ? currentState.modulo03Completed
              : typeof p.modulo03Completed === "boolean"
                ? p.modulo03Completed
                : currentState.modulo03Completed,
        };
      },
      partialize: (state) => ({
        nombre: state.nombre,
        nivel: state.nivel,
        areaPrioritaria: state.areaPrioritaria,
        capa1Saved: state.capa1Saved,
        capa2Areas: state.capa2Areas,
        visionAreas: state.visionAreas,
        criticalHabits: state.criticalHabits,
        manifiesto: state.manifiesto,
        rutinaBase: state.rutinaBase,
        sprintCommitments: state.sprintCommitments,
        modulo03Completed: state.modulo03Completed,
      }),
    },
  ),
);
