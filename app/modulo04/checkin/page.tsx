import { redirect } from "next/navigation";
import { getRecentCheckinDates, getTodayCheckin } from "@/lib/supabase/checkin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserHabits } from "@/lib/supabase/userHabits";
import CheckinPage from "./CheckinPage";

/** Suma `delta` días a una fecha en formato "YYYY-MM-DD" manteniéndola como string. */
function addDaysISO(iso: string, delta: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  dt.setUTCDate(dt.getUTCDate() + delta);
  return dt.toISOString().slice(0, 10);
}

export default async function CheckinRoute() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("eidos_profiles")
    .select("timezone")
    .eq("id", user.id)
    .maybeSingle();

  const timezone = (profile?.timezone as string) ?? "America/Mexico_City";
  const todayDate = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
  }).format(new Date());

  // Últimos 7 días (6 días atrás + hoy), ordenados del más antiguo al más reciente.
  const recentDays: string[] = Array.from({ length: 7 }, (_, i) =>
    addDaysISO(todayDate, i - 6),
  );

  // Cargamos checkin, fechas completas y hábitos del usuario en paralelo.
  // No seedeamos nada: si el usuario no tiene hábitos, CheckinPage muestra
  // el flujo de setup antes de dejarlo cerrar su día.
  const [existing, completedDates, userHabits] = await Promise.all([
    getTodayCheckin(user.id, todayDate, supabase),
    getRecentCheckinDates(user.id, recentDays[0], recentDays[6], supabase),
    getUserHabits(user.id, supabase),
  ]);

  return (
    <CheckinPage
      todayDate={todayDate}
      alreadyClosed={existing !== null}
      recentDays={recentDays}
      completedDates={Array.from(completedDates)}
      userHabits={userHabits}
      initialHabitIdsCompleted={existing?.habitIdsCompleted ?? []}
    />
  );
}
