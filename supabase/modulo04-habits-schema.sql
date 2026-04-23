-- supabase/modulo04-habits-schema.sql
-- Fase 1 del sistema de hábitos agrupados.
-- Ejecutar en Supabase Dashboard > SQL Editor DESPUÉS de modulo04-schema.sql.

-- ─────────────────────────────────────────────────────────────
-- 1) Nueva tabla: catálogo de hábitos del usuario.
--    - group_key es uno de fisicos | espirituales | mentales.
--    - is_preset distingue los que vienen de presets hardcoded
--      (útil para migrar/actualizar presets sin borrar customs).
--    - archived permite ocultarlos sin perder histórico.
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eidos_user_habits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  group_key text NOT NULL CHECK (group_key IN ('fisicos', 'espirituales', 'mentales')),
  label text NOT NULL,
  preset_slug text,
  is_preset boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  archived boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Un mismo preset_slug no debe duplicarse por usuario (evita seedear 2 veces).
CREATE UNIQUE INDEX IF NOT EXISTS eidos_user_habits_user_preset_slug_key
  ON eidos_user_habits (user_id, preset_slug)
  WHERE preset_slug IS NOT NULL;

CREATE INDEX IF NOT EXISTS eidos_user_habits_user_group_idx
  ON eidos_user_habits (user_id, group_key, sort_order);

ALTER TABLE eidos_user_habits ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "user_habits_owner" ON eidos_user_habits;
CREATE POLICY "user_habits_owner" ON eidos_user_habits
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_eidos_user_habits_updated_at ON eidos_user_habits;
CREATE TRIGGER update_eidos_user_habits_updated_at
  BEFORE UPDATE ON eidos_user_habits
  FOR EACH ROW EXECUTE FUNCTION update_boss_updated_at();

-- ─────────────────────────────────────────────────────────────
-- 2) Alter a eidos_daily_checkins:
--    - Agregar habit_ids_completed uuid[] para los hábitos
--      agrupados (separado de habits_completed text[], que
--      sigue guardando MissionKeys con prefijo rutina:/sprint:).
--    - Quitar sleep_ok / food_ok (reemplazados por hábitos
--      configurables en los grupos FÍSICOS).
-- ─────────────────────────────────────────────────────────────
ALTER TABLE eidos_daily_checkins
  ADD COLUMN IF NOT EXISTS habit_ids_completed uuid[] NOT NULL DEFAULT '{}';

ALTER TABLE eidos_daily_checkins DROP COLUMN IF EXISTS sleep_ok;
ALTER TABLE eidos_daily_checkins DROP COLUMN IF EXISTS food_ok;
