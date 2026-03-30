export const AREA_ORDER = [
  "salud",
  "mente",
  "relaciones",
  "proposito",
  "recursos",
] as const;

export type Modulo02Area = (typeof AREA_ORDER)[number];

export const AREA_LABELS: Record<Modulo02Area, string> = {
  salud: "Salud",
  mente: "Mente",
  relaciones: "Relaciones",
  proposito: "Propósito",
  recursos: "Recursos",
};

/** Mapea áreas de Módulo 02 a los IDs persistidos en Módulo 01. */
export const MODULO01_AREA_ID_BY_MODULO02: Record<Modulo02Area, string> = {
  salud: "fisica-salud",
  mente: "personal-mental",
  relaciones: "social-relaciones",
  proposito: "profesional-academica",
  recursos: "financiera",
};

export function areaNumber(area: Modulo02Area): number {
  return AREA_ORDER.indexOf(area) + 1;
}

