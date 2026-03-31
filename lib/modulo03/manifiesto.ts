import type { CriticalHabit, VisionArea } from "@/types/modulo02";
import type { Manifiesto } from "@/types/modulo03";
import { AREA_ORDER, type Modulo02Area } from "@/lib/modulo02/areas";

const FUERZA_DOMINANTE: Record<Modulo02Area, string> = {
  salud: "energía física como base",
  mente: "claridad mental como ventaja",
  relaciones: "vínculos profundos como motor",
  proposito: "propósito como brújula",
  recursos: "autonomía financiera como libertad",
};

/** Frase de identidad según nivel de onboarding (1–5), alineada con el tono del producto. */
const FRASE_NIVEL: Record<number, string> = {
  1: "alguien que está empezando a construirse con intención",
  2: "alguien que explora su potencial con curiosidad",
  3: "alguien que construye con propósito y constancia",
  4: "alguien que consolida y afina lo que ya está construyendo",
  5: "alguien que opera desde su mejor versión",
};

function truncateAtWord(text: string, max: number): string {
  const t = text.trim();
  if (t.length <= max) return t;
  const slice = t.slice(0, max);
  const lastSpace = slice.lastIndexOf(" ");
  const base = lastSpace > 20 ? slice.slice(0, lastSpace) : slice.trimEnd();
  return `${base.trimEnd()}…`;
}

function adaptDirectionStatement(statement: string): string {
  const s = statement.trim();
  const lower = s.toLowerCase();
  if (lower.startsWith("me dirijo hacia")) return s;
  if (lower.startsWith("voy hacia")) return s;
  // Tomar núcleo corto si la frase ya es tipo imperativo/poético
  return s;
}

export function nivelIdentityPhrase(onboardingNivel: number): string {
  const n = Math.min(5, Math.max(1, Math.round(onboardingNivel)));
  return FRASE_NIVEL[n] ?? FRASE_NIVEL[3];
}

function dominantArea(visions: VisionArea[]): Modulo02Area {
  const valid = visions.filter((v) =>
    AREA_ORDER.includes(v.area as Modulo02Area),
  );
  if (valid.length === 0) return "mente";
  let best = valid[0];
  for (let i = 1; i < valid.length; i++) {
    const v = valid[i];
    if (v.sourceScore > best.sourceScore) best = v;
    else if (v.sourceScore === best.sourceScore) {
      const ai = AREA_ORDER.indexOf(v.area as Modulo02Area);
      const bi = AREA_ORDER.indexOf(best.area as Modulo02Area);
      if (ai < bi) best = v;
    }
  }
  return best.area as Modulo02Area;
}

function weakestVision(visions: VisionArea[]): VisionArea | null {
  const valid = visions.filter((v) =>
    AREA_ORDER.includes(v.area as Modulo02Area),
  );
  if (valid.length === 0) return null;
  let worst = valid[0];
  for (let i = 1; i < valid.length; i++) {
    const v = valid[i];
    if (v.sourceScore < worst.sourceScore) worst = v;
    else if (v.sourceScore === worst.sourceScore) {
      const vi = AREA_ORDER.indexOf(v.area as Modulo02Area);
      const wi = AREA_ORDER.indexOf(worst.area as Modulo02Area);
      if (vi > wi) worst = v;
    }
  }
  return worst;
}

export function generateManifiestoProposal(
  nombre: string,
  onboardingNivel: number,
  visionAreas: VisionArea[],
  criticalHabits: CriticalHabit[],
): Manifiesto {
  const name = nombre.trim();
  const soy = name ? `Soy ${name}` : "Soy quien está aquí";
  const fraseNivel = nivelIdentityPhrase(onboardingNivel);
  const dom = dominantArea(visionAreas);
  const fuerza = FUERZA_DOMINANTE[dom];
  const line1 = `${soy}, ${fraseNivel} con ${fuerza}.`;

  const weak = weakestVision(visionAreas);
  const rawDir = weak
    ? adaptDirectionStatement(weak.statement)
    : "una versión más clara y honesta de mi vida.";
  const truncated = truncateAtWord(rawDir, 60);
  const core = truncated.replace(/[.\u2026…]+$/g, "").trim();
  const line2 = `Me dirijo hacia ${core}.`;

  const h1 = criticalHabits.find((h) => h.priority === 1) ?? criticalHabits[0];
  const habitName = h1?.habit ?? "mi primer hábito crítico";
  const freq = h1?.frequency ?? "con constancia semanal";
  const reasonFull = h1?.reason ?? "es el que más impacto tiene ahora";
  const reasonShort = truncateAtWord(reasonFull, 50).replace(/[.…]+$/, "");
  const line3 = `Mi primer paso es ${habitName}, ${freq}, porque ${reasonShort}.`;

  return {
    lines: [line1, line2, line3],
    createdAt: new Date().toISOString(),
  };
}
