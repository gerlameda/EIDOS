import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { DailyCheckin, MissionKey } from "@/types/modulo04";

function checkinClient(supabase?: SupabaseClient) {
  return supabase ?? createClient();
}

function rowToCheckin(row: Record<string, unknown>): DailyCheckin {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    habitsCompleted: (row.habits_completed as string[]) ?? [],
    sleepOk: row.sleep_ok as boolean,
    foodOk: row.food_ok as boolean,
    reflectionQuestion: row.reflection_question as string,
    reflectionAnswer: (row.reflection_answer as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function getTodayCheckin(
  userId: string,
  date: string,
  supabase?: SupabaseClient,
): Promise<DailyCheckin | null> {
  const client = checkinClient(supabase);
  const { data, error } = await client
    .from("eidos_daily_checkins")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (error || !data) return null;
  return rowToCheckin(data as Record<string, unknown>);
}

/**
 * Devuelve el conjunto de fechas ("YYYY-MM-DD") del usuario con check-in
 * registrado dentro del rango [fromDate, toDate] (inclusivo en ambos extremos).
 * Sirve para pintar los dots de completitud del date-scroll estilo Whoop.
 */
export async function getRecentCheckinDates(
  userId: string,
  fromDate: string,
  toDate: string,
  supabase?: SupabaseClient,
): Promise<Set<string>> {
  const client = checkinClient(supabase);
  const { data, error } = await client
    .from("eidos_daily_checkins")
    .select("date")
    .eq("user_id", userId)
    .gte("date", fromDate)
    .lte("date", toDate);

  if (error || !data) return new Set();
  return new Set((data as { date: string }[]).map((r) => r.date));
}

export async function upsertCheckin(
  userId: string,
  payload: {
    date: string;
    habitsCompleted: MissionKey[];
    sleepOk: boolean;
    foodOk: boolean;
    reflectionQuestion: string;
    reflectionAnswer: string | null;
  },
): Promise<void> {
  const supabase = createClient();
  await supabase.from("eidos_daily_checkins").upsert(
    {
      user_id: userId,
      date: payload.date,
      habits_completed: payload.habitsCompleted,
      sleep_ok: payload.sleepOk,
      food_ok: payload.foodOk,
      reflection_question: payload.reflectionQuestion,
      reflection_answer: payload.reflectionAnswer,
    },
    { onConflict: "user_id,date" },
  );
}
