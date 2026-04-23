"use client";

import { create } from "zustand";

/**
 * Floating damage number emitted al atacar.
 * Los componentes se encargan de pintarlo y quitarlo cuando termina la animación.
 */
export interface FloatingDamage {
  id: string;
  amount: number;
  isCore: boolean;
  createdAt: number;
}

interface EffectsState {
  /** Timestamp del último ataque (ms). Usado para disparar shake/flash/flinch. */
  attackTick: number;
  /** Timestamp del último "orb burst" (XP ganado). */
  orbBurstTick: number;
  /** Números de daño flotando actualmente. */
  floatingDamages: FloatingDamage[];
  /** Dispara feedback global de un ataque (shake + flash + flinch + float). */
  triggerAttack: (damage: number, isCore: boolean) => void;
  /** Dispara brillo extra del orbe (ej. al subir XP). */
  triggerOrbBurst: () => void;
  /** Limpia un damage float cuando la animación termina. */
  dismissDamage: (id: string) => void;
}

export const useEffectsStore = create<EffectsState>((set) => ({
  attackTick: 0,
  orbBurstTick: 0,
  floatingDamages: [],
  triggerAttack: (amount, isCore) => {
    const now = Date.now();
    const id = `${now}-${Math.random().toString(36).slice(2, 8)}`;
    set((state) => ({
      attackTick: now,
      orbBurstTick: now,
      floatingDamages: [
        ...state.floatingDamages,
        { id, amount, isCore, createdAt: now },
      ],
    }));
    // Autolimpieza defensiva por si el componente se desmonta antes del onAnimationEnd.
    if (typeof window !== "undefined") {
      window.setTimeout(() => {
        set((state) => ({
          floatingDamages: state.floatingDamages.filter((d) => d.id !== id),
        }));
      }, 1600);
    }
  },
  triggerOrbBurst: () => set({ orbBurstTick: Date.now() }),
  dismissDamage: (id) =>
    set((state) => ({
      floatingDamages: state.floatingDamages.filter((d) => d.id !== id),
    })),
}));
