"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CheckinStep, DailyMission, MissionKey } from "@/types/modulo04";

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

  // Respuestas del check-in
  sleepOk: boolean;
  setSleepOk: (ok: boolean) => void;
  foodOk: boolean;
  setFoodOk: (ok: boolean) => void;
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

      sleepOk: true,
      setSleepOk: (ok) => set({ sleepOk: ok }),
      foodOk: true,
      setFoodOk: (ok) => set({ foodOk: ok }),
      reflectionAnswer: "",
      setReflectionAnswer: (answer) => set({ reflectionAnswer: answer }),

      resetDay: () =>
        set({
          missions: [],
          checkinStep: 1,
          checkinDate: null,
          checkinClosed: false,
          sleepOk: true,
          foodOk: true,
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
