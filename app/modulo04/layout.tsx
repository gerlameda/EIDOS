import type { ReactNode } from "react";
import { redirect } from "next/navigation";
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
    .select("nombre, nivel")
    .eq("id", user.id)
    .maybeSingle();

  const nombre = (profile?.nombre as string) ?? "Jugador";
  const nivel = (profile?.nivel as number) ?? 1;

  return (
    <Modulo04Shell nombre={nombre} nivel={nivel}>
      {children}
    </Modulo04Shell>
  );
}
