import { createClient } from "@/lib/supabase/client";
import type { JournalEntry } from "@/types/modulo04";

function rowToEntry(row: Record<string, unknown>): JournalEntry {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    date: row.date as string,
    content: (row.content as string | null) ?? null,
    oneWord: (row.one_word as string | null) ?? null,
    intentionTomorrow: (row.intention_tomorrow as string | null) ?? null,
    bossId: (row.boss_id as string | null) ?? null,
    streakDay: row.streak_day as number,
    createdAt: row.created_at as string,
  };
}

export async function getTodayJournalEntry(
  userId: string,
  date: string,
): Promise<JournalEntry | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eidos_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .single();

  if (error || !data) return null;
  return rowToEntry(data as Record<string, unknown>);
}

export async function saveJournalEntry(
  userId: string,
  payload: {
    date: string;
    content: string | null;
    oneWord: string | null;
    intentionTomorrow: string | null;
    bossId: string | null;
    streakDay: number;
  },
): Promise<void> {
  const supabase = createClient();
  await supabase.from("eidos_journal_entries").upsert(
    {
      user_id: userId,
      date: payload.date,
      content: payload.content,
      one_word: payload.oneWord,
      intention_tomorrow: payload.intentionTomorrow,
      boss_id: payload.bossId,
      streak_day: payload.streakDay,
    },
    { onConflict: "user_id,date" },
  );
}

export async function getJournalArchive(
  userId: string,
  limitDays: number,
): Promise<JournalEntry[]> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eidos_journal_entries")
    .select("*")
    .eq("user_id", userId)
    .order("date", { ascending: false })
    .limit(limitDays);

  if (error || !data) return [];
  return data.map((row: Record<string, unknown>) => rowToEntry(row));
}

export async function getWeeklyWordPattern(
  userId: string,
  weekStart: string,
): Promise<string | null> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from("eidos_journal_entries")
    .select("one_word")
    .eq("user_id", userId)
    .gte("date", weekStart)
    .not("one_word", "is", null);

  if (error || !data || data.length === 0) return null;

  const freq: Record<string, number> = {};
  for (const row of data) {
    const raw = row.one_word;
    if (raw == null || typeof raw !== "string") continue;
    const word = raw.toLowerCase().trim();
    if (!word) continue;
    freq[word] = (freq[word] ?? 0) + 1;
  }

  const sorted = Object.entries(freq).sort((a, b) => b[1] - a[1]);
  return sorted[0]?.[0] ?? null;
}
