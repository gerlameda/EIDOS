import { createClient } from "@/lib/supabase/client";
import type { EidosProfileRow } from "@/lib/supabase/types";
import type { OnboardingStore } from "@/store/onboardingStore";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useSyncStatusStore } from "@/store/syncStatusStore";

function fallbackCapa1Saved(state: OnboardingStore): OnboardingStore["capa1Saved"] {
  return state.capa1Saved;
}

export async function loadProfileFromSupabase(
  userId: string,
): Promise<Partial<OnboardingStore> | null> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("eidos_profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error || !data) return null;

  const row = data as EidosProfileRow;
  const current = useOnboardingStore.getState();

  return {
    nombre: row.nombre,
    nivel: row.nivel as OnboardingStore["nivel"],
    areaPrioritaria: row.area_prioritaria,
    capa1Saved: Array.isArray(row.capa1_saved)
      ? (row.capa1_saved as OnboardingStore["capa1Saved"])
      : fallbackCapa1Saved(current),
    capa2Areas: Array.isArray(row.capa2_areas)
      ? (row.capa2_areas as OnboardingStore["capa2Areas"])
      : current.capa2Areas,
    visionAreas: Array.isArray(row.vision_areas)
      ? (row.vision_areas as OnboardingStore["visionAreas"])
      : current.visionAreas,
    criticalHabits: Array.isArray(row.critical_habits)
      ? (row.critical_habits as OnboardingStore["criticalHabits"])
      : current.criticalHabits,
    manifiesto: (row.manifiesto as OnboardingStore["manifiesto"]) ?? null,
    rutinaBase: (row.rutina_base as OnboardingStore["rutinaBase"]) ?? null,
    sprintCommitments: Array.isArray(row.sprint_commitments)
      ? (row.sprint_commitments as OnboardingStore["sprintCommitments"])
      : current.sprintCommitments,
    modulo03Completed: row.modulo03_completed,
  };
}

export async function saveProfileToSupabase(
  userId: string,
  state: OnboardingStore,
): Promise<void> {
  const supabase = createClient();
  const statusStore = useSyncStatusStore.getState();
  statusStore.setSyncing(true);

  try {
    const { error } = await supabase.from("eidos_profiles").upsert(
      {
        id: userId,
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
      {
        onConflict: "id",
      },
    );

    if (error) {
      const msg = `Supabase upsert: ${error.message}${
        error.code ? ` (${error.code})` : ""
      }`;
      console.error("saveProfileToSupabase upsert failed", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      statusStore.setError(msg, state);
      return;
    }

    statusStore.clearError();
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("saveProfileToSupabase threw", err);
    statusStore.setError(msg, state);
  } finally {
    statusStore.setSyncing(false);
  }
}
