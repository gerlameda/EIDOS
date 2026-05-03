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

    set({ isSyncing: true });

    try {
      // Resolvemos el userId directamente para no depender de syncProfileToSupabase,
      // que silencia el error cuando no hay sesión (llama clearError si !user).
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        set({
          isSyncing: false,
          lastError: "Sin sesión activa — inicia sesión para guardar tu progreso.",
        });
        return;
      }

      const { saveProfileToSupabase } = await import("@/lib/supabase/profile");
      const { useOnboardingStore } = await import("@/store/onboardingStore");
      await saveProfileToSupabase(user.id, useOnboardingStore.getState());
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Error desconocido";
      set({ isSyncing: false, lastError: msg });
    }
  },
}));
