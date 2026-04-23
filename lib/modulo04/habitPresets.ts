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
 * Presets hardcoded Fase 1.
 * Los slugs son snake_case y estables — no cambiarlos una vez seedeados.
 */
export const HABIT_PRESETS: HabitPreset[] = [
  // Físicos
  {
    slug: "fisicos_dormir",
    groupKey: "fisicos",
    label: "Dormir buena calidad y cantidad",
    sortOrder: 10,
  },
  {
    slug: "fisicos_comer",
    groupKey: "fisicos",
    label: "Comer con conciencia",
    sortOrder: 20,
  },
  {
    slug: "fisicos_entrenar",
    groupKey: "fisicos",
    label: "Entrenar / actividad física",
    sortOrder: 30,
  },
  // Espirituales
  {
    slug: "espirituales_meditar",
    groupKey: "espirituales",
    label: "Meditar / rezar",
    sortOrder: 10,
  },
  {
    slug: "espirituales_respiracion",
    groupKey: "espirituales",
    label: "Respiraciones conscientes",
    sortOrder: 20,
  },
  // Mentales
  {
    slug: "mentales_leer",
    groupKey: "mentales",
    label: "Leer un capítulo",
    sortOrder: 10,
  },
  {
    slug: "mentales_idioma",
    groupKey: "mentales",
    label: "Estudiar un idioma",
    sortOrder: 20,
  },
  {
    slug: "mentales_focus",
    groupKey: "mentales",
    label: "Trabajo enfocado",
    sortOrder: 30,
  },
];
