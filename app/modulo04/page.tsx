import { redirect } from "next/navigation";
import { getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import { generateBossProposal } from "@/lib/modulo04/bossGenerator";
import { getAttacksToday, loadActiveBoss } from "@/lib/supabase/boss";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserHabits } from "@/lib/supabase/userHabits";
import type { RutinaBase, SprintCommitment } from "@/types/modulo03";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import PrimerBoss from "./PrimerBoss";
import CampoBase from "./CampoBase";

function normalizeAreaKey(raw: string | null | undefined): string {
  if (!raw) return "salud";
  const base = raw.includes("/") ? raw.split("/").pop() ?? raw : raw;
  return base.toLowerCase();
}

export default async function Modulo04Page() {
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

  const [boss, attacksToday, userHabits] = await Promise.all([
    loadActiveBoss(user.id, supabase),
    getAttacksToday(user.id, todayDate, supabase),
    getUserHabits(user.id, supabase),
  ]);

  if (boss) {
    const { data: profileData } = await supabase
      .from("eidos_profiles")
      .select("rutina_base, sprint_commitments, capa2_areas")
      .eq("id", user.id)
      .single();

    const rutinaBase =
      (profileData?.rutina_base as RutinaBase | null) ?? null;
    const sprintCommitments = Array.isArray(profileData?.sprint_commitments)
      ? (profileData.sprint_commitments as SprintCommitment[])
      : [];
    const capa2Areas = Array.isArray(profileData?.capa2_areas)
      ? (profileData.capa2_areas as Capa2AreaStatus[])
      : [];

    return (
      <CampoBase
        userId={user.id}
        boss={boss}
        attacksToday={attacksToday}
        rutinaBase={rutinaBase}
        sprintCommitments={sprintCommitments}
        capa2Areas={capa2Areas}
        userHabits={userHabits}
      />
    );
  }

  const { data: profileFullRaw } = await supabase
    .from("eidos_profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  const profileFull = profileFullRaw as Record<string, unknown> | null;

  const capa1Saved = (profileFull?.capa1_saved as unknown) ?? [];
  const capa2Areas = (profileFull?.capa2_areas as unknown) ?? [];
  const criticalHabits = (profileFull?.critical_habits as unknown[]) ?? [];
  const visionAreas = (profileFull?.vision_areas as unknown[]) ?? [];
  const areaPrioritariaRaw = profileFull?.area_prioritaria as
    | string
    | undefined;

  const areaNormalizada = normalizeAreaKey(areaPrioritariaRaw);

  const scores = getUnifiedAreaScores(
    capa1Saved as (Capa1AreaAnswer | null)[],
    capa2Areas as Capa2AreaStatus[],
  );
  const areaScore =
    scores.find((s) => s.areaId.toLowerCase() === areaNormalizada)?.score ??
    50;

  const coreAttack =
    (criticalHabits[0] as { habit?: string } | undefined)?.habit ??
    "Tu hábito principal";

  const visionForArea = visionAreas.find((v) => {
    const va = v as { area?: string };
    return va.area && normalizeAreaKey(va.area) === areaNormalizada;
  }) as { horizon?: string } | undefined;

  const horizon = visionForArea?.horizon ?? "6 meses";

  const proposal = generateBossProposal({
    areaFocus: areaNormalizada,
    areaScore,
    coreAttack,
    horizon,
  });

  return <PrimerBoss proposal={proposal} />;
}

