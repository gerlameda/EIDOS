/** Campos de `eidos_profiles` sincronizados desde onboarding (snake_case = DB). */
export type EidosProfileSyncPayload = {
  nombre: string;
  nivel: number;
  area_prioritaria: string;
  capa1_saved: unknown;
  capa2_areas: unknown;
  vision_areas: unknown;
  critical_habits: unknown;
  manifiesto: unknown;
  rutina_base: unknown;
  sprint_commitments: unknown;
  modulo03_completed: boolean;
};

export const EIDOS_PENDING_PROFILE_COOKIE = "eidos-pending-profile";

export const EIDOS_PENDING_PROFILE_MAX_AGE_SEC = 600;

export function tryParsePendingProfileCookieValue(
  raw: string,
): EidosProfileSyncPayload | null {
  let decoded = raw;
  try {
    decoded = decodeURIComponent(raw);
  } catch {
    /* valor sin encode */
  }
  try {
    const parsed = JSON.parse(decoded) as unknown;
    return normalizePendingProfilePayload(parsed);
  } catch {
    return null;
  }
}

function normalizePendingProfilePayload(
  x: unknown,
): EidosProfileSyncPayload | null {
  if (!x || typeof x !== "object") return null;
  const o = x as Record<string, unknown>;
  if (typeof o.nombre !== "string") return null;
  if (typeof o.nivel !== "number" || !Number.isFinite(o.nivel)) return null;
  if (typeof o.area_prioritaria !== "string") return null;
  if (typeof o.modulo03_completed !== "boolean") return null;
  return {
    nombre: o.nombre,
    nivel: Math.round(o.nivel),
    area_prioritaria: o.area_prioritaria,
    capa1_saved: o.capa1_saved ?? [],
    capa2_areas: o.capa2_areas ?? [],
    vision_areas: o.vision_areas ?? [],
    critical_habits: o.critical_habits ?? [],
    manifiesto: o.manifiesto ?? null,
    rutina_base: o.rutina_base ?? null,
    sprint_commitments: o.sprint_commitments ?? [],
    modulo03_completed: o.modulo03_completed,
  };
}
