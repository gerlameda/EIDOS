import type { HabitGroupKey } from "@/types/modulo04";

/**
 * Catálogo de hábitos preset que se seedean al usuario la primera vez que
 * abre el check-in. El `slug` es el identificador estable: permite detectar
 * si ya existe para no duplicar en seeds futuros.
 */
export interface HabitPreset {
  slug: string;
  groupKey: HabitGroupKey;
  label: string;
  sortOrder: number;
}

/** Etiquetas legibles para cada grupo en la UI. */
export const HABIT_GROUP_LABEL: Record<HabitGroupKey, string> = {
  fisicos: "FÍSICOS",
  espirituales: "ESPIRITUALES",
  mentales: "MENTALES",
};

/** Orden en que se renderizan los grupos en el check-in. */
export const HABIT_GROUP_ORDER: HabitGroupKey[] = [
  "fisicos",
  "espirituales",
  "mentales",
];

/**
 * Catálogo completo de hábitos que se pueden adoptar desde el check-in (y
 * desde el mapa). Los slugs son snake_case y estables — no cambiarlos una
 * vez seedeados, porque sirven de clave de deduplicación para los usuarios
 * que ya los agregaron.
 *
 * Si un preset cambia de redacción se preserva el mismo slug; si cambia el
 * concepto por completo se crea un slug nuevo para no pisar datos viejos.
 */
export const HABIT_PRESETS: HabitPreset[] = [
  // ─── Físicos ───────────────────────────────────────────────────────────
  {
    slug: "fisicos_entrenar",
    groupKey: "fisicos",
    label: "Entrenar",
    sortOrder: 10,
  },
  {
    slug: "fisicos_comer",
    groupKey: "fisicos",
    label: "Comer con intención",
    sortOrder: 20,
  },
  {
    slug: "fisicos_hidratacion",
    groupKey: "fisicos",
    label: "Hidratación adecuada",
    sortOrder: 30,
  },
  {
    slug: "fisicos_dormir",
    groupKey: "fisicos",
    label: "Dormir suficiente",
    sortOrder: 40,
  },
  {
    slug: "fisicos_sobrio",
    groupKey: "fisicos",
    label: "Mantenerse sobrio / sin exceso",
    sortOrder: 50,
  },
  {
    slug: "fisicos_descanso_activo",
    groupKey: "fisicos",
    label: "Descanso activo (estiramientos / caminar)",
    sortOrder: 60,
  },
  {
    slug: "fisicos_aire_libre",
    groupKey: "fisicos",
    label: "Estar al aire libre / recibir sol",
    sortOrder: 70,
  },
  {
    slug: "fisicos_rutina_matutina",
    groupKey: "fisicos",
    label: "Rutina matutina (5–15 min)",
    sortOrder: 80,
  },
  {
    slug: "fisicos_sin_pantallas_noche",
    groupKey: "fisicos",
    label: "Evitar pantallas antes de dormir",
    sortOrder: 90,
  },
  {
    slug: "fisicos_postura_dia",
    groupKey: "fisicos",
    label: "Postura y movimiento durante el día",
    sortOrder: 100,
  },

  // ─── Espirituales ──────────────────────────────────────────────────────
  {
    slug: "espirituales_meditar",
    groupKey: "espirituales",
    label: "Meditar / rezar",
    sortOrder: 10,
  },
  {
    slug: "espirituales_gratitud",
    groupKey: "espirituales",
    label: "Gratitud consciente (3 cosas)",
    sortOrder: 20,
  },
  {
    slug: "espirituales_silencio",
    groupKey: "espirituales",
    label: "Silencio intencional",
    sortOrder: 30,
  },
  {
    slug: "espirituales_servicio",
    groupKey: "espirituales",
    label: "Servicio / ayudar a alguien",
    sortOrder: 40,
  },
  {
    slug: "espirituales_journal",
    groupKey: "espirituales",
    label: "Journaling espiritual",
    sortOrder: 50,
  },
  {
    slug: "espirituales_lectura",
    groupKey: "espirituales",
    label: "Leer algo inspirador",
    sortOrder: 60,
  },
  {
    slug: "espirituales_respiracion",
    groupKey: "espirituales",
    label: "Respiración consciente",
    sortOrder: 70,
  },
  {
    slug: "espirituales_perdonar",
    groupKey: "espirituales",
    label: "Perdonar (a ti o a otro)",
    sortOrder: 80,
  },
  {
    slug: "espirituales_visualizacion",
    groupKey: "espirituales",
    label: "Visualización / intención del día",
    sortOrder: 90,
  },
  {
    slug: "espirituales_sin_agenda",
    groupKey: "espirituales",
    label: "Espacio sin agenda / contemplación",
    sortOrder: 100,
  },

  // ─── Mentales ──────────────────────────────────────────────────────────
  {
    slug: "mentales_leer",
    groupKey: "mentales",
    label: "Leer algo que te haga crecer",
    sortOrder: 10,
  },
  {
    slug: "mentales_aprender",
    groupKey: "mentales",
    label: "Aprender / estudiar algo nuevo",
    sortOrder: 20,
  },
  {
    slug: "mentales_focus",
    groupKey: "mentales",
    label: "Trabajo enfocado (sin distracciones)",
    sortOrder: 30,
  },
  {
    slug: "mentales_sin_doomscroll",
    groupKey: "mentales",
    label: "Sin scroll sin propósito",
    sortOrder: 40,
  },
  {
    slug: "mentales_planear_dia",
    groupKey: "mentales",
    label: "Planear el día / priorizar",
    sortOrder: 50,
  },
  {
    slug: "mentales_reto",
    groupKey: "mentales",
    label: "Hacer algo nuevo / reto mental",
    sortOrder: 60,
  },
  {
    slug: "mentales_escuchar",
    groupKey: "mentales",
    label: "Escuchar con atención a alguien",
    sortOrder: 70,
  },
  {
    slug: "mentales_revisar_metas",
    groupKey: "mentales",
    label: "Revisar tus metas y hábitos",
    sortOrder: 80,
  },
  {
    slug: "mentales_pensamiento_silencio",
    groupKey: "mentales",
    label: "Pensamiento en silencio / reflexionar",
    sortOrder: 90,
  },
  {
    slug: "mentales_limitar_pantalla",
    groupKey: "mentales",
    label: "Limitar tiempo de pantalla",
    sortOrder: 100,
  },
];
