import { redirect } from "next/navigation";
import { getGlobalScore, getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import MapaClient from "./MapaClient";

export default async function MapaPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("eidos_profiles")
    .select("capa1_saved, capa2_areas")
    .eq("id", user.id)
    .maybeSingle();

  const capa1Saved = Array.isArray(profile?.capa1_saved)
    ? (profile.capa1_saved as (Capa1AreaAnswer | null)[])
    : [];
  const capa2Areas = Array.isArray(profile?.capa2_areas)
    ? (profile.capa2_areas as Capa2AreaStatus[])
    : [];

  const unified = getUnifiedAreaScores(capa1Saved, capa2Areas);
  const globalScore = getGlobalScore(unified);

  return <MapaClient unifiedScores={unified} globalScore={globalScore} />;
}
