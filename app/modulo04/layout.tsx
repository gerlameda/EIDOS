import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import {
  capa1GlobalNivelFromSaved,
  type Capa1AreaAnswer,
} from "@/lib/modulo01/capa1-flow-data";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import Modulo04Shell from "./Modulo04Shell";

export default async function Modulo04Layout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("eidos_profiles")
    .select("nombre, capa1_saved")
    .eq("id", user.id)
    .maybeSingle();

  const nombre = (profile?.nombre as string) ?? "Jugador";
  const capa1Saved = Array.isArray(profile?.capa1_saved)
    ? (profile.capa1_saved as (Capa1AreaAnswer | null)[])
    : [];
  const global = capa1GlobalNivelFromSaved(capa1Saved);
  const nivelLabel = global?.nivelLabel ?? "Despertando";

  return (
    <Modulo04Shell nombre={nombre} nivelLabel={nivelLabel}>
      {children}
    </Modulo04Shell>
  );
}
