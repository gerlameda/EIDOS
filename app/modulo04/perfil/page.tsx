import { redirect } from "next/navigation";
import { capa1GlobalNivelFromSaved } from "@/lib/modulo01/capa1-flow-data";
import { loadActiveBoss } from "@/lib/supabase/boss";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import PerfilClient from "./PerfilClient";

export default async function PerfilPage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("eidos_profiles")
    .select("nombre, nivel, capa1_saved, manifiesto")
    .eq("id", user.id)
    .single();

  const nombre = (profile?.nombre as string) ?? "Jugador";
  const nivel = (profile?.nivel as number) ?? 1;
  const capa1Saved = (profile?.capa1_saved as unknown[]) ?? [];
  const manifiesto = profile?.manifiesto as {
    lines: [string, string, string];
  } | null;

  const global = capa1GlobalNivelFromSaved(capa1Saved as any[]);
  const tier = global?.tier ?? "low";
  const nivelLabel = global?.nivelLabel ?? "Despertando";

  const boss = await loadActiveBoss(user.id, supabase);

  return (
    <PerfilClient
      nombre={nombre}
      nivel={nivel}
      nivelLabel={nivelLabel}
      tier={tier}
      manifiesto={manifiesto}
      boss={boss}
    />
  );
}
