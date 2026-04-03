"use server";

import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Boss } from "@/types/boss";

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
