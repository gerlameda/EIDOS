"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Boss } from "@/types/boss";

/** XP necesario por cada nivel. Constante simple para v1 del juego-feel. */
export const XP_PER_LEVEL = 100;

export function levelFromXp(xp: number): number {
  return Math.floor(xp / XP_PER_LEVEL) + 1;
}

export function xpProgressPercent(xp: number): number {
  return ((xp % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
}

interface BossState {
  activeBoss: Boss | null;
  streakDays: number;
  /** XP acumulado de por vida. Sube con cada damage aplicado. */
  totalXp: number;
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
      totalXp: 0,
      setActiveBoss: (boss) => set({ activeBoss: boss }),
      applyDamage: (damage) =>
        set((state) => {
          const nextXp = state.totalXp + damage;
          if (!state.activeBoss) return { totalXp: nextXp };
          const newHp = Math.max(0, state.activeBoss.currentHp - damage);
          const phase =
            newHp <= 0
              ? "desesperado"
              : newHp <= state.activeBoss.maxHp * 0.4
                ? "herido"
                : "intimidando";
          return {
            totalXp: nextXp,
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
      clearBoss: () => set({ activeBoss: null, streakDays: 0, totalXp: 0 }),
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
