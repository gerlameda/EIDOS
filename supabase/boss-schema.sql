-- supabase/boss-schema.sql
-- Ejecutar en Supabase Dashboard > SQL Editor

CREATE TABLE IF NOT EXISTS eidos_bosses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  max_hp integer NOT NULL DEFAULT 100,
  current_hp integer NOT NULL DEFAULT 100,
  phase text NOT NULL DEFAULT 'intimidando' CHECK (phase IN ('intimidando', 'herido', 'desesperado')),
  deadline date NOT NULL,
  area_focus text NOT NULL,
  core_attack text NOT NULL,
  taunt_intimidando text NOT NULL DEFAULT '¿Eso es todo lo que tienes?',
  taunt_herido text NOT NULL DEFAULT 'No me rindas ahora...',
  taunt_desesperado text NOT NULL DEFAULT 'Imposible. Esto no puede estar pasando.',
  defeated boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE eidos_bosses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "boss_owner" ON eidos_bosses
  FOR ALL USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS eidos_boss_attacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  boss_id uuid NOT NULL REFERENCES eidos_bosses(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mission_key text NOT NULL,
  damage integer NOT NULL,
  is_core boolean NOT NULL DEFAULT false,
  registered_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE eidos_boss_attacks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "attack_owner" ON eidos_boss_attacks
  FOR ALL USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION update_boss_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language plpgsql;

CREATE TRIGGER update_eidos_bosses_updated_at
  BEFORE UPDATE ON eidos_bosses
  FOR EACH ROW EXECUTE FUNCTION update_boss_updated_at();
