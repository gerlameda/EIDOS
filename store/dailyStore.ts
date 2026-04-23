"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckinStep, DailyMission, MissionKey } from "@/types/modulo04";

/** Respuesta del usuario a un hábito en el check-in. `undefined` = sin tocar. */
export type HabitStatus = "yes" | "no";

interface DailyState {
  // Misiones del día
  missions: DailyMission[];
  setMissions: (missions: DailyMission[]) => void;
  markMission: (key: MissionKey, timestamp: string) => void;

  // Estado del check-in
  checkinStep: CheckinStep;
  setCheckinStep: (step: CheckinStep) => void;
  checkinDate: string | null;
  setCheckinDate: (date: string) => void;
  checkinClosed: boolean;
  setCheckinClosed: (closed: boolean) => void;

  // Hábitos agrupados (FISICOS / ESPIRITUALES / MENTALES) marcados hoy.
  // Map parcial: si no hay entry para un habitId, significa "sin tocar".
  habitStatuses: Record<string, HabitStatus>;
  setHabitStatus: (id: string, status: HabitStatus) => void;
  /** Reinicia todos los statuses (usado al resetear el día). */
  clearHabitStatuses: () => void;
  /** Marca varios hábitos como "yes" — útil al hidratar desde Supabase. */
  hydrateHabitStatuses: (yesIds: string[]) => void;

  // Respuesta de reflexión libre
  reflectionAnswer: string;
  setReflectionAnswer: (answer: string) => void;

  // Reset diario
  resetDay: () => void;
}

export const useDailyStore = create<DailyState>()(
  persist(
    (set) => ({
      missions: [],
      setMissions: (missions) => set({ missions }),
      markMission: (key, timestamp) =>
        set((state) => ({
          missions: state.missions.map((m) =>
            m.key === key ? { ...m, markedAt: timestamp } : m,
          ),
        })),

      checkinStep: 1,
      setCheckinStep: (step) => set({ checkinStep: step }),
      checkinDate: null,
      setCheckinDate: (date) => set({ checkinDate: date }),
      checkinClosed: false,
      setCheckinClosed: (closed) => set({ checkinClosed: closed }),

      habitStatuses: {},
      setHabitStatus: (id, status) =>
        set((state) => ({
          habitStatuses: { ...state.habitStatuses, [id]: status },
        })),
      clearHabitStatuses: () => set({ habitStatuses: {} }),
      hydrateHabitStatuses: (yesIds) =>
        set((state) => {
          const next = { ...state.habitStatuses };
          for (const id of yesIds) next[id] = "yes";
          return { habitStatuses: next };
        }),

      reflectionAnswer: "",
      setReflectionAnswer: (answer) => set({ reflectionAnswer: answer }),

      resetDay: () =>
        set({
          missions: [],
          checkinStep: 1,
          checkinDate: null,
          checkinClosed: false,
          habitStatuses: {},
          reflectionAnswer: "",
        }),
    }),
    {
      name: "eidos-daily",
      storage: {
        getItem: (key) => {
          if (typeof window === "undefined") return null;
          const item = sessionStorage.getItem(key);
          return item ? JSON.parse(item) : null;
        },
        setItem: (key, value) => {
          if (typeof window === "undefined") return;
          sessionStorage.setItem(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          if (typeof window === "undefined") return;
          sessionStorage.removeItem(key);
        },
      },
    },
  ),
);
