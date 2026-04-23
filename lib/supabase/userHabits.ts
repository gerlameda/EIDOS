import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import { HABIT_PRESETS } from "@/lib/modulo04/habitPresets";
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
 * Si `seedIfEmpty` está activo y el usuario no tiene ningún hábito, inserta los
 * presets antes de devolverlos.
 */
export async function getUserHabits(
  userId: string,
  supabase?: SupabaseClient,
  opts: { seedIfEmpty?: boolean } = {},
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

  const rows = (data as Record<string, unknown>[]) ?? [];
  if (rows.length === 0 && opts.seedIfEmpty) {
    await ensureDefaultHabits(userId, client);
    return getUserHabits(userId, client, { seedIfEmpty: false });
  }

  return rows.map(rowToUserHabit);
}

/**
 * Inserta los presets faltantes para el usuario. Es idempotente: usa el
 * índice único (user_id, preset_slug) y `ON CONFLICT DO NOTHING` implícito
 * vía `upsert({ignoreDuplicates:true})`.
 */
export async function ensureDefaultHabits(
  userId: string,
  supabase?: SupabaseClient,
): Promise<void> {
  const client = habitsClient(supabase);

  const rows = HABIT_PRESETS.map((p) => ({
    user_id: userId,
    group_key: p.groupKey,
    label: p.label,
    preset_slug: p.slug,
    is_preset: true,
    sort_order: p.sortOrder,
    archived: false,
  }));

  const { error } = await client.from("eidos_user_habits").upsert(rows, {
    onConflict: "user_id,preset_slug",
    ignoreDuplicates: true,
  });

  if (error) {
    // eslint-disable-next-line no-console
    console.error("ensureDefaultHabits error:", error);
  }
}
