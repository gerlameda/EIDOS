-- supabase/agenda-schema.sql
-- Tabla para eventos de agenda del usuario (calendar page en /modulo04/agenda).
-- Ejecutar en Supabase Dashboard > SQL Editor.
--
-- Un "evento" es cualquier cosa con fecha de inicio (obligatoria). Todos los
-- demás campos son opcionales — así podemos guardar desde recordatorios simples
-- ("llamar a mi mamá") hasta eventos multi-día con horarios y tags.

CREATE TABLE IF NOT EXISTS eidos_agenda_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Obligatorio
  title text NOT NULL CHECK (char_length(title) > 0 AND char_length(title) <= 200),
  start_date date NOT NULL,

  -- Opcionales
  end_date date,                 -- Si viene, debe ser >= start_date
  start_time text,               -- HH:MM (24h). Null = evento de día completo.
  end_time text,                 -- HH:MM.
  tags text[] NOT NULL DEFAULT '{}',
  notes text,

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT eidos_agenda_events_date_range_chk
    CHECK (end_date IS NULL OR end_date >= start_date),
  CONSTRAINT eidos_agenda_events_start_time_chk
    CHECK (start_time IS NULL OR start_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$'),
  CONSTRAINT eidos_agenda_events_end_time_chk
    CHECK (end_time IS NULL OR end_time ~ '^([01][0-9]|2[0-3]):[0-5][0-9]$')
);

CREATE INDEX IF NOT EXISTS eidos_agenda_events_user_date_idx
  ON eidos_agenda_events (user_id, start_date);

ALTER TABLE eidos_agenda_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "agenda_events_owner" ON eidos_agenda_events;
CREATE POLICY "agenda_events_owner" ON eidos_agenda_events
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP TRIGGER IF EXISTS update_eidos_agenda_events_updated_at ON eidos_agenda_events;
CREATE TRIGGER update_eidos_agenda_events_updated_at
  BEFORE UPDATE ON eidos_agenda_events
  FOR EACH ROW EXECUTE FUNCTION update_boss_updated_at();
