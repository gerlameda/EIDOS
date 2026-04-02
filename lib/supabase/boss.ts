import { createClient } from "@/lib/supabase/client";
import type { Boss } from "@/types/boss";

function rowToBoss(row: Record<string, unknown>): Boss {
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

export async function loadActiveBoss(userId: string): Promise<Boss | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eidos_bosses")
    .select("*")
    .eq("user_id", userId)
    .eq("defeated", false)
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (error || !data) return null;
  return rowToBoss(data as Record<string, unknown>);
}

export async function saveBossHp(
  bossId: string,
  currentHp: number,
  phase: Boss["phase"],
  defeated: boolean,
): Promise<void> {
  const supabase = createClient();
  await supabase
    .from("eidos_bosses")
    .update({ current_hp: currentHp, phase, defeated })
    .eq("id", bossId);
}

export async function registerAttack(
  bossId: string,
  userId: string,
  missionKey: string,
  damage: number,
  isCore: boolean,
): Promise<void> {
  const supabase = createClient();
  await supabase.from("eidos_boss_attacks").insert({
    boss_id: bossId,
    user_id: userId,
    mission_key: missionKey,
    damage,
    is_core: isCore,
  });
}

export async function getAttacksToday(
  userId: string,
  todayDate: string,
): Promise<string[]> {
  const supabase = createClient();
  const startOfDay = `${todayDate}T00:00:00.000Z`;
  const endOfDay = `${todayDate}T23:59:59.999Z`;

  const { data, error } = await supabase
    .from("eidos_boss_attacks")
    .select("mission_key")
    .eq("user_id", userId)
    .gte("registered_at", startOfDay)
    .lte("registered_at", endOfDay);

  if (error || !data) return [];
  return data.map((row: { mission_key: string }) => row.mission_key);
}
