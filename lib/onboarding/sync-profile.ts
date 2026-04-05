import { createClient } from "@/lib/supabase/client";
import type { OnboardingStore } from "@/store/onboardingStore";

export async function syncProfileToSupabase(
  state: Pick<
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
  >,
): Promise<void> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;

    await supabase.from("eidos_profiles").upsert(
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
  } catch {
    /* silencioso — nunca bloquear el flujo del usuario */
  }
}
