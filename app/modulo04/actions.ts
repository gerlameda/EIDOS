"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  addUserHabit,
  archiveUserHabit,
} from "@/lib/supabase/userHabits";
import type { Boss } from "@/types/boss";
import type { HabitGroupKey, UserHabit } from "@/types/modulo04";

export async function createBossAction(
  proposal: Omit<Boss, "id" | "userId" | "createdAt" | "updatedAt">,
): Promise<Boss | null> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("eidos_bosses")
    .insert({
      user_id: user.id,
      name: proposal.name,
      max_hp: proposal.maxHp,
      current_hp: proposal.currentHp,
      phase: proposal.phase,
      deadline: proposal.deadline,
      area_focus: proposal.areaFocus,
      core_attack: proposal.coreAttack,
      taunt_intimidando: proposal.tauntPhrases.intimidando,
      taunt_herido: proposal.tauntPhrases.herido,
      taunt_desesperado: proposal.tauntPhrases.desesperado,
      defeated: false,
    })
    .select("*")
    .single();

  if (error || !data) {
    // eslint-disable-next-line no-console
    console.error("createBossAction error:", error);
    return null;
  }

  const row = data as Record<string, unknown>;
  return {
    id: row.id as string,
    userId: row.user_id as string,
    name: row.name as string,
    maxHp: row.max_hp as number,
    currentHp: row.current_hp as number,
    phase: row.phase as Boss["phase"],
    deadline: row.deadline as string,
    areaFocus: row.area_focus as string,
    coreAttack: row.core_attack as string,
    tauntPhrases: {
      intimidando: row.taunt_intimidando as string,
      herido: row.taunt_herido as string,
      desesperado: row.taunt_desesperado as string,
    },
    defeated: row.defeated as boolean,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

export async function upsertCheckinAction(payload: {
  date: string;
  habitsCompleted: string[];
  habitIdsCompleted: string[];
  reflectionQuestion: string;
  reflectionAnswer: string | null;
}): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("eidos_daily_checkins").upsert(
    {
      user_id: user.id,
      date: payload.date,
      habits_completed: payload.habitsCompleted,
      habit_ids_completed: payload.habitIdsCompleted,
      reflection_question: payload.reflectionQuestion,
      reflection_answer: payload.reflectionAnswer,
    },
    { onConflict: "user_id,date" },
  );

  if (error) {
    // eslint-disable-next-line no-console
    console.error("upsertCheckinAction error:", error);
    return false;
  }
  return true;
}

export async function addUserHabitAction(payload: {
  groupKey: HabitGroupKey;
  label: string;
  presetSlug?: string | null;
}): Promise<{ habit: UserHabit | null; error: string | null }> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const label = payload.label.trim();
  if (!label) return { habit: null, error: "El nombre no puede estar vacío." };

  const result = await addUserHabit(
    user.id,
    {
      groupKey: payload.groupKey,
      label,
      presetSlug: payload.presetSlug ?? null,
    },
    supabase,
  );
  if (result.habit) revalidatePath("/modulo04/checkin");
  return result;
}

export async function archiveUserHabitAction(habitId: string): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ok = await archiveUserHabit(user.id, habitId, supabase);
  if (ok) revalidatePath("/modulo04/checkin");
  return ok;
}

export async function saveJournalAction(payload: {
  date: string;
  content: string | null;
  oneWord: string | null;
  intentionTomorrow: string | null;
  bossId: string | null;
  streakDay: number;
}): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("eidos_journal_entries").upsert(
    {
      user_id: user.id,
      date: payload.date,
      content: payload.content,
      one_word: payload.oneWord,
      intention_tomorrow: payload.intentionTomorrow,
      boss_id: payload.bossId,
      streak_day: payload.streakDay,
    },
    { onConflict: "user_id,date" },
  );

  if (error) {
    // eslint-disable-next-line no-console
    console.error("saveJournalAction error:", error);
    return false;
  }
  return true;
}
