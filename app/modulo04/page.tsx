import { redirect } from "next/navigation";
import { getAttacksToday, loadActiveBoss } from "@/lib/supabase/boss";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CampoBase from "./CampoBase";

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

  return (
    <CampoBase
      userId={user.id}
      boss={boss}
      attacksToday={attacksToday}
      todayDate={todayDate}
    />
  );
}
