# EIDOS — Módulo 04 Design Spec
**Fecha:** 2026-04-02
**Versión:** 1.1
**Estado:** Aprobado — listo para implementar
**Proyecto:** GER GREATNESS · Ciudad de México · 2026

---

## Contexto

Módulos 01–03 construyen el mapa, la visión y el sistema del usuario. Módulo 04 es donde el juego arranca en modo diario. No es un módulo que se "completa" — es el home al que el usuario regresa indefinidamente. Es el motor de D14 retention.

**Pregunta central:** *¿Cómo está tu partida hoy?*
**Output diario:** Boss HP actualizado + resumen narrativo del día + entrada de journal opcional.

---

## Principios de Diseño

- Una pantalla, una acción a la vez
- El sistema propone, el usuario valida — nunca pantalla en blanco
- El juego es el diferenciador: debe sentirse como videojuego, no como tracker
- No castiga el fallo — lo contextualiza y celebra lo que sí ocurrió
- Identidad antes que ejecución — las misiones vienen del sistema del usuario, no de una lista genérica

---

## Arco Completo de M04

```
Dashboard
    │
    └── [botón "Mi Juego"] ──→  Campo Base  (home diario)
                                     │
                                     ├── Misiones del día con botón ⚔️ Hecho
                                     │       │
                                     │       └── daño inmediato al boss
                                     │
                                     └── [tab] Check-in Nocturno
                                                    │
                                                    ├── Paso 1: Hábitos (sin doble conteo)
                                                    ├── Paso 2: Sueño + Comida
                                                    ├── Paso 3: Reflexión del día
                                                    ├── Resumen narrativo
                                                    │
                                                    └── [botón] Journal
                                                                   │
                                                                   ├── Área libre + Una palabra + Intención mañana
                                                                   └── Archivo de entradas (semana / mes / año)
```

---

## 1. El Campo Base — Home Diario

El usuario llega aquí desde el dashboard. Es la pantalla principal del juego activo.

### Secciones

**Header:**
```
[Nombre] Chronicles                    +65 XP hoy
Construyendo · Estratega               🔥 4 días de racha  [estado del personaje]
```

El header incluye el widget `StateIndicator` (del Boss System spec) que muestra el estado actual del personaje: 🔥 En racha / ⚡ En flujo / 😴 Fatigado / 💀 Estancado / 🛡 Recuperando.

**Boss activo:**
```
"Ni me hiciste cosquillas."        ← BossTaunt widget (frase según fase actual)

EL CORREDOR IMPARABLE
████████████░░░░░░░░░  42% HP · HERIDO       Deadline: 1 Jun
                                              StreakCounter widget
```

**Misiones del día** (widget `DailyMissionList`):

```
✓  Correr 5K          Física · −20 HP registrado    [ya marcado]
○  Leer 30 min        Mente  · −5 HP                [⚔️ Hecho]
○  Meditar 10 min     Mente  · −5 HP                [⚔️ Hecho]
```

**CTA nocturno** — brilla en dorado cuando el check-in del día no está cerrado:
```
╔═══════════════════════════════╗
║  CHECK-IN NOCTURNO PENDIENTE  ║
║  Cierra tu día · 2 min        ║
║  [Cerrar mi día →]            ║
╚═══════════════════════════════╝
```

### Construcción de la lista de misiones diarias

Las misiones se construyen combinando dos fuentes del store:

**Fuente 1 — `rutinaBase` (M03):**

```typescript
// RutinaBase tiene 3 bloques: manana, tarde, noche
// Cada bloque tiene: { habits: string[] }
// Cada string es el texto del hábito (ej. "Correr 5K")
```

Cada hábito de `rutinaBase` se convierte en una misión con daño `−5 HP` (misión de área, según Boss System spec).

**Fuente 2 — `sprintCommitments` (M03):**

```typescript
// SprintCommitment: { habit: string, area: string, days: DayOfWeek[], ... }
// Solo los commitments cuyo array `days` incluye el día de hoy se muestran
```

Cada sprint commitment activo hoy también genera `−5 HP` al boss, salvo que el hábito coincida con uno de los `bossAttacks` del boss activo (ver Boss System spec), en cuyo caso genera `−20 HP` (core attack).

**Regla de deduplicación:**

Un hábito que aparece tanto en `rutinaBase` como en `sprintCommitments` se muestra **una sola vez** — se le da prioridad a la versión de `sprintCommitments` (por tener más contexto de área y días). La comparación se hace por texto normalizado (`habit.toLowerCase().trim()`).

**Identificador de misión:**

Cada misión en la lista del día tiene una clave compuesta `missionKey = \`${source}:${normalizedHabitText}\`` (ej. `"sprint:correr 5k"` o `"rutina:leer 30 min"`). Esta clave es el identificador canónico para el anti-doble conteo.

### Mecánica de ataque en tiempo real

- Cada misión tiene un botón `⚔️ Hecho` que el usuario presiona **después de completar la acción en la vida real**
- Al presionar: el boss pierde HP inmediatamente, se anima la barra, aparece el daño (`−20 HP` o `−5 HP`)
- La misión queda marcada con tachado y "ya registrado"
- El multiplicador de racha se aplica automáticamente (`×1.2` para 3–6 días, `×1.5` para 7+)
- El ataque se persiste en `eidos_boss_damage_log` (Boss System spec) inmediatamente

---

## 2. Check-in Nocturno

**Trigger:** email que sale a las 8:00 pm. La hora se envía en UTC y el servidor calcula el offset usando la zona horaria guardada en el perfil del usuario (`timezone: string` — campo en `eidos_profiles`, capturado en el registro de cuenta usando `Intl.DateTimeFormat().resolvedOptions().timeZone` del browser). Si no hay timezone registrado, el default es `America/Mexico_City`.

El tab del check-in siempre está accesible desde el Campo Base.

**Propósito principal:** el usuario se da cuenta de que su día fue mejor de lo que creía — aunque no haya completado todo, lo que sí hizo se hace visible.

### Paso 1 — ¿Qué completaste hoy?

La lista de misiones del día se pre-carga igual que en el Campo Base. Las misiones ya atacadas durante el día (identificadas por su `missionKey` en `eidos_boss_damage_log`) aparecen bloqueadas:

```
✓  Correr 5K      [ya registrado — no editable]
○  Leer 30 min    [marcar si se hizo]
○  Meditar 10 min [marcar si se hizo]
```

**Anti-doble conteo:** al marcar una misión en el check-in que **no** fue atacada durante el día, se registra el ataque en ese momento (mismo flujo que el botón `⚔️ Hecho`). Las misiones con `missionKey` ya presente en `eidos_boss_damage_log` de hoy no pueden volver a marcarse — el daño no se duplica.

### Paso 2 — ¿Cómo estuviste?

Dos preguntas rápidas (2 taps cada una):

```
😴 Sueño     [Bien] [Mal]
🥗 Comida    [Bien] [Mal]
```

Estas respuestas alimentan el sistema de recuperación del boss:
- Sueño mal → boss recupera +15 HP (registrado en `eidos_boss_damage_log` como `BAD_SLEEP`)
- Comida mal → boss recupera +10 HP (registrado como `JUNK_FOOD`)

### Paso 3 — Reflexión del día

Una pregunta contextualizada al día real del usuario — seleccionada de forma determinista según prioridad de contexto:

| Prioridad | Contexto detectado | Ejemplo de pregunta |
|---|---|---|
| 1 (mayor) | Boss en agonía (<39% HP) | *"El boss está casi derrotado. ¿Qué necesitas para el golpe final?"* |
| 2 | Completó su misión core | *"Corriste aunque no querías. ¿Qué te hizo hacerlo de todas formas?"* |
| 3 | Racha activa (3+ días) | *"Llevas 4 días consecutivos. ¿Qué cambió?"* |
| 4 | Durmió mal | *"El sueño afecta todo lo demás. ¿Qué lo causó?"* |
| 5 (menor) | No completó ninguna misión | *"¿Qué le quitó espacio a tus misiones hoy?"* |

Si ningún contexto aplica, se usa una pregunta genérica: *"¿Qué fue lo más importante de hoy?"*

Respuesta: libre (campo de texto) **o** selección de opciones predefinidas. Nunca pantalla en blanco.

### Resumen final — "Tu día"

Narrativo, celebratorio, sin score numérico. Se calcula al cerrar el check-in:

```
TU DÍA

Completaste 1 de 3 misiones.
El boss perdió 20 HP — sigue cayendo.
Dormiste bien — eso cuenta.
Mañana tienes otra oportunidad.
```

`boss_hp_delta` del día = suma de todos los registros de `eidos_boss_damage_log` del día para este usuario y boss. Se calcula en el momento del resumen final, no se almacena como campo independiente en `eidos_daily_checkins` — el source of truth es siempre el log.

Tono: reconoce lo que sí ocurrió antes de mencionar lo que no. La narrativa nunca castiga — interpreta.

**→ Botón dorado:** `Escribir en el journal`

---

## 3. Journal del Jugador

Pantalla separada, accesible desde el botón al final del check-in. Opcional pero invitado.

### Entrada activa

**Header:**
```
MIÉRCOLES · 2 ABRIL 2026
Día 4 de racha · El Corredor Imparable
```

**Área libre** (placeholder que desaparece al escribir):
```
Sin filtro. ¿Qué pasó hoy?
Actuaste desde [nombre].
¿Qué patrón viste?
¿Qué te sorprendió?
```

**Una palabra** — la esencia del día:
```
UNA PALABRA
┌──────────────────────┐
│ ej. enfocado         │
└──────────────────────┘
```

**Intención mañana** — puente al siguiente día (hint contextual según boss y área prioritaria del usuario):
```
INTENCIÓN MAÑANA
┌──────────────────────┐
│ ej. deep work 3h     │
└──────────────────────┘
```

**Guardar →**

### Archivo de entradas

Visible debajo del botón guardar. Ordenado por semana → mes → año.

```
[Semana] [Mes] [Año]

ESTA SEMANA

Martes 1 Abr                              constante
Hoy sentí que el sistema funcionó...
→ deep work 2h en la mañana

Lunes 31 Mar                              resistencia
No quería salir a correr. Lo hice...
→ no rendirme en semana 2
```

Cada entrada muestra:
- Fecha
- **Su palabra del día** en color según categoría (ver regla abajo)
- Preview de los primeros 60 caracteres del área libre
- Su intención del día siguiente

**Regla de color de "una palabra":**

La categoría se determina por una lista estática de palabras clave (sin IA):

| Color | Significado | Palabras clave de ejemplo |
|---|---|---|
| Cyan (`#22D3EE`) | Positiva / expansión | enfocado, claro, energía, flujo, presente, productivo, agradecido, fuerte |
| Dorado (`#C9A84C`) | Esfuerzo / superación | resistencia, determinado, difícil, luché, cansado pero seguí, esfuerzo |
| Muted (`#4A5568`) | Neutral / difícil | cansado, perdido, confundido, triste, abrumado, sin energía |

Si la palabra del usuario no está en ninguna lista: color muted por default. La lista se puede extender en el código sin cambiar la interfaz.

**Patrón detectado** (sin IA — solo frecuencia de `one_word` en la semana):
```
PATRÓN DETECTADO
Tu palabra más frecuente esta semana: constante
```

---

## 4. Mecánicas Conectadas a Módulos Anteriores

| Dato del store | Uso en M04 |
|---|---|
| `rutinaBase` (M03) | Fuente de hábitos diarios — se convierte en misiones con `−5 HP` |
| `sprintCommitments` (M03) | Misiones del sprint activo hoy — `−5 HP` o `−20 HP` si es core attack |
| `criticalHabits` (M02) | Referencia para determinar qué hábitos son de alto impacto (usados en boss creation, no en M04 directamente) |
| `visionAreas` (M02) | Conecta el boss con la visión de área del usuario (usado en boss creation) |
| `nombre` + `nivel` | Personalizan el placeholder del journal y el header del campo base |

---

## 5. Sistema de Notificaciones (MVP)

La zona horaria del usuario se captura en el registro de cuenta con `Intl.DateTimeFormat().resolvedOptions().timeZone` y se guarda en `eidos_profiles.timezone`. Default: `America/Mexico_City`.

Los emails se envían via Supabase Edge Functions + Resend (o equivalente ya configurado en el proyecto).

| Evento | Canal | Timing |
|---|---|---|
| Check-in del día pendiente | Email | 8:00 pm hora local del usuario |
| Boss en agonía (<39% HP) | Email | Al registrarse la transición de fase |
| Racha en riesgo (sin check-in hoy) | Email | 10:00 pm hora local si no hay check-in registrado |

Notificaciones push nativas: post-MVP (requiere PWA o app nativa).

---

## 6. Nuevas Tablas en Supabase

```sql
-- Campo en tabla existente eidos_profiles (agregar vía migration)
ALTER TABLE eidos_profiles ADD COLUMN timezone text NOT NULL DEFAULT 'America/Mexico_City';

-- Check-ins diarios
CREATE TABLE eidos_daily_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,                          -- fecha local del usuario (YYYY-MM-DD)
  habits_completed text[] NOT NULL DEFAULT '{}', -- array de missionKeys completados en check-in
                                               -- formato: "sprint:correr 5k" o "rutina:leer 30 min"
  sleep_ok boolean NOT NULL,
  food_ok boolean NOT NULL,
  reflection_question text NOT NULL,
  reflection_answer text,                      -- null si no respondió
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)                        -- un check-in por usuario por día
);

-- Entradas de journal
CREATE TABLE eidos_journal_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  content text,                                -- área libre (puede estar vacía)
  one_word text,                               -- una palabra (puede estar vacía)
  intention_tomorrow text,                     -- intención mañana (puede estar vacía)
  boss_id uuid REFERENCES eidos_bosses(id),    -- boss activo al escribir (nullable)
  streak_day integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)                        -- una entrada por usuario por día
);

-- RLS
ALTER TABLE eidos_daily_checkins ENABLE ROW LEVEL SECURITY;
ALTER TABLE eidos_journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "checkin_owner" ON eidos_daily_checkins FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "journal_owner" ON eidos_journal_entries FOR ALL USING (auth.uid() = user_id);
```

**Nota sobre `boss_hp_delta`:** el daño neto del día no se almacena en `eidos_daily_checkins`. El source of truth es siempre `eidos_boss_damage_log` (Boss System spec). El resumen del día se calcula en tiempo real sumando los registros del log del día.

---

## 7. Widgets Reutilizables

| Widget | Qué muestra | Usado en |
|---|---|---|
| `DailyMissionList` | Misiones del día construidas desde rutinaBase + sprint, con botón ⚔️ Hecho | Campo Base, Check-in Paso 1 |
| `CheckinProgress` | Indicador de paso actual (1 de 3, 2 de 3, 3 de 3) | Check-in |
| `DaySummaryCard` | Resumen narrativo del día (sin score) | Check-in cierre |
| `JournalEntryForm` | Área libre + una palabra + intención mañana | Journal |
| `JournalArchive` | Lista de entradas con filtro semana/mes/año + patrón detectado | Journal |
| `WordPatternBadge` | Palabra más frecuente de la semana con su color | Journal archivo |
| `StateIndicator` | Estado del personaje (En racha / Fatigado / etc.) | Campo Base header |

Widgets reutilizados del Boss System spec: `BossHPBar`, `BossTaunt`, `StreakCounter`.

Widgets del Boss System spec fuera del alcance de M04: `DamagePreview`, `EventAlert`, `GolpeFinaleAlert` — pertenecen a la vista de boss activo (`/boss/[id]`) del Boss System, no al Campo Base de M04.

---

## 8. Flujo de Primera Vez

Cuando el usuario completa M03 por primera vez, llega a una pantalla de transición antes de entrar al Campo Base:

```
Tu sistema está listo.
Ahora el juego empieza en serio.

[Crear mi primer boss →]
```

Este botón lleva al `BossCreationWizard` (Boss System spec, Sección 5). El wizard es parte del **Boss System** — M04 depende de que esté implementado pero no lo implementa. Al completar el wizard, el usuario llega al Campo Base con el boss activo.

**Estado sin boss activo:** si el usuario llega al Campo Base sin boss, en lugar de las misiones se muestra el CTA de creación:

```
┌─────────────────────────────┐
│ Sin enemigo activo          │
│ El juego empieza cuando     │
│ nombras a tu primer boss.   │
│ [Crear mi boss →]           │
└─────────────────────────────┘
```

---

## 9. Fuera del Alcance del MVP

- Notificaciones push nativas (requiere PWA o app)
- IA para análisis de journal y preguntas de reflexión generadas dinámicamente
- Patrón detectado más allá de frecuencia de palabras
- Social features (comparar racha con amigos)
- Replay semanal animado ("tu semana en 60 segundos")
- `DamagePreview` y `EventAlert` widgets del Boss System (pertenecen a `/boss/[id]`)

---

## 10. Métrica de Validación

**TC-04:** ≥ 70% de beta users que completan M03 tienen al menos 1 check-in registrado en los primeros 3 días.
**D14 retention:** ≥ 40% de beta users vuelven a la app en el día 14 con al menos 1 check-in registrado.

---

*EIDOS · Módulo 04 Design Spec v1.1 · Confidencial · GER GREATNESS · 2026*
