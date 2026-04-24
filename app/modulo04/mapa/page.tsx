import { redirect } from "next/navigation";
import { getGlobalScore, getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getUserHabits } from "@/lib/supabase/userHabits";
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

  // Hábitos que ya tiene el usuario (label + group). Sirven para que el mapa
  // pinte como "✓ Adoptada" cualquier misión cuyo título ya esté en su lista,
  // incluso si la adoptó en una sesión anterior (el estado local se resetea
  // al navegar y sin esto todas aparecerían como "Adoptar" de nuevo).
  const existingHabits = await getUserHabits(user.id, supabase);
  const adoptedLabels = existingHabits.map((h) => ({
    label: h.label,
    groupKey: h.groupKey,
  }));

  return (
    <MapaClient
      unifiedScores={unified}
      globalScore={globalScore}
      adoptedLabels={adoptedLabels}
    />
  );
}
