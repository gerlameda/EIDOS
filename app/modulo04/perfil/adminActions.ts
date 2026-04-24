"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

/**
 * Devuelve la fecha "hoy" en la zona horaria del perfil del usuario
 * (o CDMX por default si el perfil no la tiene).
 */
async function todayForUser(userId: string): Promise<string> {
  const supabase = await createServerSupabaseClient();
  const { data } = await supabase
    .from("eidos_profiles")
    .select("timezone")
    .eq("id", userId)
    .maybeSingle();
  const tz = (data?.timezone as string) ?? "America/Mexico_City";
  return new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date());
}

/**
 * Upsert de un check-in vacío para HOY — útil si olvidaste cerrar el día
 * y quieres que la racha y los widgets lo cuenten como cerrado.
 */
export async function adminMarkCheckinCompletedAction(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = await todayForUser(user.id);
  const { error } = await supabase.from("eidos_daily_checkins").upsert(
    {
      user_id: user.id,
      date: today,
      habits_completed: [],
      habit_ids_completed: [],
      reflection_question: "",
      reflection_answer: null,
    },
    { onConflict: "user_id,date" },
  );

  if (error) {
    console.error("[EIDOS][admin] markCheckinCompleted error", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/modulo04", "layout");
  return { ok: true, error: null };
}

/**
 * Borra el row de check-in de hoy, para poder volver a llenarlo.
 */
export async function adminReopenCheckinAction(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const today = await todayForUser(user.id);
  const { error } = await supabase
    .from("eidos_daily_checkins")
    .delete()
    .eq("user_id", user.id)
    .eq("date", today);

  if (error) {
    console.error("[EIDOS][admin] reopenCheckin error", error);
    return { ok: false, error: error.message };
  }
  revalidatePath("/modulo04", "layout");
  return { ok: true, error: null };
}

/**
 * Borrón y cuenta nueva: limpia todo el onboarding + hábitos + bosses +
 * historial. La cuenta de auth sigue viva, pero el usuario vuelve al
 * onboarding como si fuera su primera vez.
 *
 * Borra en orden:
 *  - eidos_agenda_events (todos)
 *  - eidos_journal_entries (todos)
 *  - eidos_daily_checkins (todos)
 *  - eidos_user_habits (todos)
 *  - eidos_boss_attacks (todos los del user_id)
 *  - eidos_bosses (todos)
 *  - eidos_profiles jsonb fields → null (capa1/capa2/vision/rutina/manifiesto/etc)
 *
 * No hace redirect desde el server (el cliente navega después de confirmar).
 */
export async function adminFullResetAction(): Promise<{
  ok: boolean;
  error: string | null;
}> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const tablesToWipe = [
    "eidos_agenda_events",
    "eidos_journal_entries",
    "eidos_daily_checkins",
    "eidos_user_habits",
    "eidos_boss_attacks",
    "eidos_bosses",
  ];

  for (const table of tablesToWipe) {
    const { error } = await supabase.from(table).delete().eq("user_id", user.id);
    if (error) {
      console.error(`[EIDOS][admin] fullReset delete ${table} error`, error);
      return {
        ok: false,
        error: `No se pudo limpiar ${table}: ${error.message}`,
      };
    }
  }

  // Limpiamos los JSONB del perfil (el row sigue existiendo — es tu auth).
  const { error: profileError } = await supabase
    .from("eidos_profiles")
    .update({
      capa1_saved: null,
      capa2_areas: null,
      critical_habits: null,
      vision_areas: null,
      rutina_base: null,
      sprint_commitments: null,
      manifiesto: null,
      area_prioritaria: null,
      nombre: null,
      nivel: 1,
    })
    .eq("id", user.id);

  if (profileError) {
    console.error(
      "[EIDOS][admin] fullReset reset profile error",
      profileError,
    );
    return {
      ok: false,
      error: `No se pudo limpiar el perfil: ${profileError.message}`,
    };
  }

  revalidatePath("/", "layout");
  return { ok: true, error: null };
}
