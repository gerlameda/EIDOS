-- supabase/eidos-profiles-schema.sql
-- Ejecutar en Supabase Dashboard > SQL Editor
-- Crea la tabla eidos_profiles y el trigger que registra
-- automáticamente a cada usuario nuevo al confirmarse su cuenta.

-- ─────────────────────────────────────────
-- 1. TABLA PRINCIPAL
-- ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS eidos_profiles (
  id                  uuid        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now(),

  -- Datos básicos del onboarding
  nombre              text        NOT NULL DEFAULT '',
  nivel               integer     NOT NULL DEFAULT 1,
  area_prioritaria    text        NOT NULL DEFAULT '',

  -- Progreso por módulo (almacenado como JSONB)
  capa1_saved         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  capa2_areas         jsonb       NOT NULL DEFAULT '[]'::jsonb,
  vision_areas        jsonb       NOT NULL DEFAULT '[]'::jsonb,
  critical_habits     jsonb       NOT NULL DEFAULT '[]'::jsonb,
  manifiesto          jsonb,
  rutina_base         jsonb,
  sprint_commitments  jsonb       NOT NULL DEFAULT '[]'::jsonb,

  -- Flags de completado
  modulo03_completed  boolean     NOT NULL DEFAULT false,

  -- Zona horaria (agregada por modulo04-schema.sql, incluida aquí para tener un solo lugar)
  timezone            text        NOT NULL DEFAULT 'America/Mexico_City'
);

-- ─────────────────────────────────────────
-- 2. ROW LEVEL SECURITY
-- ─────────────────────────────────────────
ALTER TABLE eidos_profiles ENABLE ROW LEVEL SECURITY;

-- Cada usuario solo puede leer y escribir su propio perfil.
CREATE POLICY "profiles_owner" ON eidos_profiles
  FOR ALL
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ─────────────────────────────────────────
-- 3. TRIGGER: updated_at automático
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_eidos_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_eidos_profiles_updated_at ON eidos_profiles;
CREATE TRIGGER trg_eidos_profiles_updated_at
  BEFORE UPDATE ON eidos_profiles
  FOR EACH ROW EXECUTE FUNCTION update_eidos_profiles_updated_at();

-- ─────────────────────────────────────────
-- 4. TRIGGER: auto-registro de usuarios nuevos
--    Se dispara cada vez que un usuario confirma
--    su cuenta en auth.users (INSERT en esa tabla).
--    Esto garantiza que siempre exista una fila en
--    eidos_profiles para cada usuario autenticado,
--    incluso si el frontend falla al guardar.
-- ─────────────────────────────────────────
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Ignoramos usuarios anónimos: solo creamos perfil para cuentas reales.
  IF NEW.is_anonymous THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.eidos_profiles (id)
  VALUES (NEW.id)
  ON CONFLICT (id) DO NOTHING;  -- Seguro si el perfil ya existe.

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- El trigger se conecta a auth.users (tabla de Supabase Auth).
DROP TRIGGER IF EXISTS trg_on_auth_user_created ON auth.users;
CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
