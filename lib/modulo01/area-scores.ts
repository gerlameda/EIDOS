import type { Capa1AreaAnswer } from "@/lib/modulo01/capa1-flow-data";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import { CAPA1_AREAS } from "@/lib/modulo01/capa1-flow-data";

export interface AreaScore {
  areaId: string;
  label: string;
  score: number | null; // null si el área no tiene datos aún
  source: "capa1" | "capa2";
}

/**
 * Devuelve un array unificado con el score de cada área.
 * Capa 1: score viene de capa1Saved[i].score
 * Capa 2: score viene de capa2Areas[i].percentageScore
 * Orden: primero las 5 de Capa 1, luego las 5 de Capa 2.
 */
export function getUnifiedAreaScores(
  capa1Saved: (Capa1AreaAnswer | null)[],
  capa2Areas: Capa2AreaStatus[]
): AreaScore[] {
  const capa1Scores: AreaScore[] = CAPA1_AREAS.map((area, i) => ({
    areaId: area.id,
    label: area.label,
    score: capa1Saved[i]?.score ?? null,
    source: "capa1" as const,
  }));

  const capa2Scores: AreaScore[] = capa2Areas.map((area) => ({
    areaId: area.areaId,
    label: area.areaId, // reemplazar con label real cuando estén definidas
    score: area.percentageScore,
    source: "capa2" as const,
  }));

  return [...capa1Scores, ...capa2Scores];
}

/**
 * Score global promedio de todas las áreas con datos.
 * Ignora áreas con score null.
 */
export function getGlobalScore(scores: AreaScore[]): number | null {
  const withData = scores.filter((a) => a.score !== null);
  if (withData.length === 0) return null;
  const sum = withData.reduce((acc, a) => acc + (a.score ?? 0), 0);
  return Math.round(sum / withData.length);
}

/**
 * Lógica simple de narrativa dinámica basada en los scores actuales.
 * Devuelve una frase que refleja el estado más destacado del perfil.
 * IA en V2 — por ahora reglas fijas.
 */
export function getDynamicNarrative(scores: AreaScore[]): string {
  const withData = scores.filter((a) => a.score !== null);
  if (withData.length === 0) return "Tu perfil está tomando forma.";

  const sorted = [...withData].sort((a, b) => (b.score ?? 0) - (a.score ?? 0));
  const highest = sorted[0];
  const lowest = sorted[sorted.length - 1];

  const gap = (highest.score ?? 0) - (lowest.score ?? 0);

  // Perfil muy desequilibrado
  if (gap >= 50) {
    return `${highest.label} es tu fortaleza. ${lowest.label} pide atención.`;
  }

  // Todo bajo
  const avg = getGlobalScore(scores) ?? 0;
  if (avg < 35) {
    return "El sistema acaba de despertar. Todo tiene margen de crecer.";
  }

  // Todo alto
  if (avg >= 70) {
    return "Sistema sólido. El siguiente nivel exige más de ti.";
  }

  // Equilibrado medio
  return "Tienes base. Ahora se trata de dirección.";
}

