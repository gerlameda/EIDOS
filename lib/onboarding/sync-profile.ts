import { createClient } from "@/lib/supabase/client";
import type { OnboardingStore } from "@/store/onboardingStore";
import { useSyncStatusStore } from "@/store/syncStatusStore";

export type SyncProfileState = Pick<
  OnboardingStore,
  | "nombre"
  | "nivel"
  | "areaPrioritaria"
  | "capa1Saved"
  | "capa2Areas"
  | "visionAreas"
  | "criticalHabits"
  | "manifiesto"
  | "rutinaBase"
  | "sprintCommitments"
  | "modulo03Completed"
>;

export interface SyncResult {
  ok: boolean;
  error: string | null;
}

export async function syncProfileToSupabase(
  state: SyncProfileState,
): Promise<SyncResult> {
  const statusStore = useSyncStatusStore.getState();
  statusStore.setSyncing(true);

  try {
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError) {
      const msg = `Auth error: ${authError.message}`;
      console.error("syncProfileToSupabase auth failed", authError);
      statusStore.setError(msg, state);
      return { ok: false, error: msg };
    }

    if (!user) {
      // No hay sesión — no es un error, solo no sincronizamos.
      statusStore.clearError();
      return { ok: true, error: null };
    }

    const { error: upsertError } = await supabase
      .from("eidos_profiles")
      .upsert(
        {
          id: user.id,
          nombre: state.nombre,
          nivel: state.nivel,
          area_prioritaria: state.areaPrioritaria,
          capa1_saved: state.capa1Saved,
          capa2_areas: state.capa2Areas,
          vision_areas: state.visionAreas,
          critical_habits: state.criticalHabits,
          manifiesto: state.manifiesto,
          rutina_base: state.rutinaBase,
          sprint_commitments: state.sprintCommitments,
          modulo03_completed: state.modulo03Completed,
        },
        { onConflict: "id" },
      );

    if (upsertError) {
      const msg = `Supabase upsert: ${upsertError.message}${
        upsertError.code ? ` (${upsertError.code})` : ""
      }`;
      console.error("syncProfileToSupabase upsert failed", {
        message: upsertError.message,
        code: upsertError.code,
        details: upsertError.details,
        hint: upsertError.hint,
      });
      statusStore.setError(msg, state);
      return { ok: false, error: msg };
    }

    statusStore.clearError();
    return { ok: true, error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("syncProfileToSupabase threw", err);
    statusStore.setError(msg, state);
    return { ok: false, error: msg };
  } finally {
    statusStore.setSyncing(false);
  }
}
