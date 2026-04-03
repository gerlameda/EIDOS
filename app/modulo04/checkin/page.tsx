import { redirect } from "next/navigation";
import { getTodayCheckin } from "@/lib/supabase/checkin";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import CheckinPage from "./CheckinPage";

export default async function CheckinRoute() {
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

  const existing = await getTodayCheckin(user.id, todayDate, supabase);

  return (
    <CheckinPage
      userId={user.id}
      todayDate={todayDate}
      alreadyClosed={existing !== null}
    />
  );
}
