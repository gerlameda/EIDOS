-- supabase/modulo04-schema.sql
-- Ejecutar en Supabase Dashboard > SQL Editor

ALTER TABLE eidos_profiles
  ADD COLUMN IF NOT EXISTS timezone text NOT NULL DEFAULT 'America/Mexico_City';

CREATE TABLE IF NOT EXISTS eidos_daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  habits_completed text[] NOT NULL DEFAULT '{}',
  sleep_ok boolean NOT NULL DEFAULT true,
  food_ok boolean NOT NULL DEFAULT true,
  reflection_question text NOT NULL DEFAULT '',
  reflection_answer text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS eidos_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  content text,
  one_word text,
  intention_tomorrow text,
  boss_id uuid REFERENCES eidos_bosses(id) ON DELETE SET NULL,
  streak_day integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

ALTER TABLE eidos_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE eidos_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkin_owner" ON eidos_daily_checkins
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "journal_owner" ON eidos_journal_entries
  FOR ALL USING (auth.uid() = user_id);

CREATE TRIGGER update_eidos_daily_checkins_updated_at
  BEFORE UPDATE ON eidos_daily_checkins
  FOR EACH ROW EXECUTE FUNCTION update_boss_updated_at();

CREATE TRIGGER update_eidos_journal_entries_updated_at
  BEFORE UPDATE ON eidos_journal_entries
  FOR EACH ROW EXECUTE FUNCTION update_boss_updated_at();
