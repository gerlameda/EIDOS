import { redirect } from "next/navigation";
import { getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import { generateBossProposal } from "@/lib/modulo04/bossGenerator";
import { getAttacksToday, loadActiveBoss } from "@/lib/supabase/boss";
import { createServerSupabaseClient } from "@/lib/supabase/server";
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

  const [boss, attacksToday] = await Promise.all([
    loadActiveBoss(user.id, supabase),
    getAttacksToday(user.id, todayDate, supabase),
  ]);

  if (boss) {
    return (
      <CampoBase
        userId={user.id}
        boss={boss}
        attacksToday={attacksToday}
        todayDate={todayDate}
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
    capa1Saved as any[],
    capa2Areas as any[],
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

