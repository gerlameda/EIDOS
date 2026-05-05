import { createClient } from "@/lib/supabase/client";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

function capa1SavedHasData(saved: unknown): boolean {
  if (!Array.isArray(saved)) return false;
  return saved.some((x) => x != null);
}

function manifiestoHasContent(m: unknown): boolean {
  if (m == null) return false;
  if (typeof m === "string") return m.trim().length > 0;
  if (typeof m === "object" && !Array.isArray(m)) {
    const o = m as Record<string, unknown>;
    const lines = o.lines;
    if (Array.isArray(lines)) {
      return lines.some((x) => x != null && String(x).trim().length > 0);
    }
    return Object.keys(o).length > 0;
  }
  return false;
}

/**
 * Client-side equivalent of the callback route's redirectPathFromProfile.
 *
 * Call this after any successful auth (email signup/login or Google OAuth).
 * It syncs local store data to Supabase, reads the profile, and navigates
 * to the correct step/module for this user.
 */
export async function redirectAfterAuth(): Promise<void> {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    window.location.href = "/onboarding/4";
    return;
  }

  // Persist any local onboarding data accumulated before auth.
  await syncProfileToSupabase(useOnboardingStore.getState());

  const { data: profile } = await supabase
    .from("eidos_profiles")
    .select("modulo03_completed, manifiesto, capa1_saved, nombre")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile) {
    window.location.href = "/onboarding/4";
    return;
  }

  if (profile.modulo03_completed === true) {
    window.location.href = "/modulo04";
    return;
  }
  if (manifiestoHasContent(profile.manifiesto)) {
    window.location.href = "/modulo03/cierre";
    return;
  }
  if (capa1SavedHasData(profile.capa1_saved)) {
    window.location.href = "/modulo02";
    return;
  }
  const nombre = profile.nombre;
  if (typeof nombre === "string" && nombre.trim().length > 0) {
    window.location.href = "/onboarding/5";
    return;
  }
  window.location.href = "/onboarding/4";
}
