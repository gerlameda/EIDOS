import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { HabitGroupKey, UserHabit } from "@/types/modulo04";

function habitsClient(supabase?: SupabaseClient) {
  return supabase ?? createClient();
}

function rowToUserHabit(row: Record<string, unknown>): UserHabit {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    groupKey: row.group_key as HabitGroupKey,
    label: row.label as string,
    presetSlug: (row.preset_slug as string | null) ?? null,
    isPreset: row.is_preset as boolean,
    sortOrder: row.sort_order as number,
    archived: row.archived as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Devuelve los hábitos no archivados del usuario, ordenados por grupo y sort_order.
 * No seedea nada: el usuario empieza con 0 y configura sus hábitos antes del primer
 * check-in (ver flujo de setup en CheckinPage).
 */
export async function getUserHabits(
  userId: string,
  supabase?: SupabaseClient,
): Promise<UserHabit[]> {
  const client = habitsClient(supabase);

  const { data, error } = await client
    .from("eidos_user_habits")
    .select("*")
    .eq("user_id", userId)
    .eq("archived", false)
    .order("group_key", { ascending: true })
    .order("sort_order", { ascending: true });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("getUserHabits error:", error);
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(rowToUserHabit);
}

/**
 * Inserta un hábito nuevo para el usuario. Si viene de un preset (presetSlug),
 * respeta el índice único (user_id, preset_slug) — un segundo intento es no-op.
 * Devuelve el hábito insertado o null si hubo error/duplicado.
 */
export async function addUserHabit(
  userId: string,
  payload: {
    groupKey: HabitGroupKey;
    label: string;
    presetSlug?: string | null;
    sortOrder?: number;
  },
  supabase?: SupabaseClient,
): Promise<UserHabit | null> {
  const client = habitsClient(supabase);

  const { data, error } = await client
    .from("eidos_user_habits")
    .insert({
      user_id: userId,
      group_key: payload.groupKey,
      label: payload.label,
      preset_slug: payload.presetSlug ?? null,
      is_preset: !!payload.presetSlug,
      sort_order: payload.sortOrder ?? 100,
      archived: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error("addUserHabit error:", error);
    return null;
  }

  return rowToUserHabit(data as Record<string, unknown>);
}

/**
 * Marca un hábito como archivado (no lo borra para preservar el histórico
 * de habit_ids_completed en check-ins pasados).
 */
export async function archiveUserHabit(
  userId: string,
  habitId: string,
  supabase?: SupabaseClient,
): Promise<boolean> {
  const client = habitsClient(supabase);

  const { error } = await client
    .from("eidos_user_habits")
    .update({ archived: true })
    .eq("id", habitId)
    .eq("user_id", userId);

  if (error) {
    // eslint-disable-next-line no-console
    console.error("archiveUserHabit error:", error);
    return false;
  }
  return true;
}
