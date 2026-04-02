"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Boss } from "@/types/boss";

interface BossState {
  activeBoss: Boss | null;
  streakDays: number;
  setActiveBoss: (boss: Boss | null) => void;
  applyDamage: (damage: number) => void;
  incrementStreak: () => void;
  resetStreak: () => void;
  clearBoss: () => void;
}

export const useBossStore = create<BossState>()(
  persist(
    (set) => ({
      activeBoss: null,
      streakDays: 0,
      setActiveBoss: (boss) => set({ activeBoss: boss }),
      applyDamage: (damage) =>
        set((state) => {
          if (!state.activeBoss) return state;
          const newHp = Math.max(0, state.activeBoss.currentHp - damage);
          const phase =
            newHp <= 0
              ? "desesperado"
              : newHp <= state.activeBoss.maxHp * 0.4
                ? "herido"
                : "intimidando";
          return {
            activeBoss: {
              ...state.activeBoss,
              currentHp: newHp,
              phase,
              defeated: newHp <= 0,
            },
          };
        }),
      incrementStreak: () =>
        set((state) => ({ streakDays: state.streakDays + 1 })),
      resetStreak: () => set({ streakDays: 0 }),
      clearBoss: () => set({ activeBoss: null, streakDays: 0 }),
    }),
    {
      name: "eidos-boss",
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
