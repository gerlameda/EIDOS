import { redirect } from "next/navigation";
import { loadActiveBoss } from "@/lib/supabase/boss";
import {
  getJournalArchive,
  getTodayJournalEntry,
  getWeeklyWordPattern,
} from "@/lib/supabase/journal";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import JournalPage from "./JournalPage";

export default async function JournalRoute() {
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

  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  const weekStart = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
  }).format(monday);

  const [todayEntry, archiveRaw, weeklyPattern, boss] = await Promise.all([
    getTodayJournalEntry(user.id, todayDate, supabase),
    getJournalArchive(user.id, 30, supabase),
    getWeeklyWordPattern(user.id, weekStart, supabase),
    loadActiveBoss(user.id, supabase),
  ]);

  const archive = archiveRaw.filter((e) => e.date !== todayDate);

  return (
    <JournalPage
      todayDate={todayDate}
      todayEntry={todayEntry}
      archive={archive}
      weeklyPattern={weeklyPattern}
      bossId={boss?.id ?? null}
    />
  );
}
