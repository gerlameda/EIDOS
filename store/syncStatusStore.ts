"use client";
import { create } from "zustand";
import type { SyncProfileState } from "@/lib/onboarding/sync-profile";

interface SyncStatusState {
  lastError: string | null;
  lastFailedAt: number | null;
  isSyncing: boolean;
  /** Snapshot del state que falló — permite reintentar con los mismos datos. */
  lastFailedPayload: SyncProfileState | null;

  setError: (error: string, payload: SyncProfileState) => void;
  clearError: () => void;
  setSyncing: (syncing: boolean) => void;
  retryLast: () => Promise<void>;
}

export const useSyncStatusStore = create<SyncStatusState>((set, get) => ({
  lastError: null,
  lastFailedAt: null,
  isSyncing: false,
  lastFailedPayload: null,

  setError: (error, payload) =>
    set({
      lastError: error,
      lastFailedAt: Date.now(),
      lastFailedPayload: payload,
    }),

  clearError: () =>
    set({
      lastError: null,
      lastFailedAt: null,
      lastFailedPayload: null,
    }),

  setSyncing: (syncing) => set({ isSyncing: syncing }),

  retryLast: async () => {
    const payload = get().lastFailedPayload;
    if (!payload) return;
    // Import dinámico para evitar ciclos (sync-profile usa este store).
    const { syncProfileToSupabase } = await import(
      "@/lib/onboarding/sync-profile"
    );
    await syncProfileToSupabase(payload);
  },
}));
