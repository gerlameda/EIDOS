export type Capa1Rango = "bajo" | "medio" | "alto";

export const CAPA1_RANGO_COLORS: Record<Capa1Rango, string> = {
  bajo: "#EF4444",
  medio: "#F59E0B",
  alto: "#22D3EE",
};

export const CAPA1_NIVEL_POR_RANGO: Record<Capa1Rango, string> = {
  bajo: "Despertando",
  medio: "Explorando",
  alto: "Construyendo",
};

/** Nivel global del avatar (promedio de scores respondidos). */
export type Capa1AvatarTier = "low" | "mid" | "high";

export function capa1AvatarTierFromRango(rango: Capa1Rango): Capa1AvatarTier {
  if (rango === "bajo") return "low";
  if (rango === "medio") return "mid";
  return "high";
}

/** Promedio de todos los scores no nulos; `null` si no hay ninguna área respondida. */
export function capa1PromedioAnswered(
  saved: readonly (Capa1AreaAnswer | null)[],
): number | null {
  const scores = saved
    .filter((x): x is Capa1AreaAnswer => x !== null)
    .map((a) => a.score);
  if (scores.length === 0) return null;
  return scores.reduce((s, n) => s + n, 0) / scores.length;
}

/** Rango global a partir del promedio (mismos cortes 0–40 / 41–70 / 71–100). */
export function capa1GlobalRangoFromPromedio(promedio: number): Capa1Rango {
  return capa1RangoFromScore(Math.round(promedio));
}

export function capa1GlobalNivelFromSaved(saved: readonly (Capa1AreaAnswer | null)[]) {
  const promedio = capa1PromedioAnswered(saved);
  if (promedio === null) return null;
  const rango = capa1GlobalRangoFromPromedio(promedio);
  return {
    promedio,
    rango,
    nivelLabel: CAPA1_NIVEL_POR_RANGO[rango],
    tier: capa1AvatarTierFromRango(rango),
  };
}

/** Área respondida con mayor score (empate: la primera en orden del mapa). */
export function capa1HighlightAnswer(
  saved: readonly (Capa1AreaAnswer | null)[],
): Capa1AreaAnswer | null {
  const answered = saved.filter((x): x is Capa1AreaAnswer => x !== null);
  if (answered.length === 0) return null;
  let best = answered[0];
  for (let i = 1; i < answered.length; i++) {
    if (answered[i].score > best.score) best = answered[i];
  }
  return best;
}

export function capa1RangoFromScore(score: number): Capa1Rango {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  if (s <= 40) return "bajo";
  if (s <= 70) return "medio";
  return "alto";
}

export function capa1InterpolateRespuesta(
  template: string,
  score: number,
): string {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  return template.split("{{score}}").join(`${s}%`);
}

export type Capa1AreaDef = {
  id: string;
  label: string;
  framing: string;
  pregunta: string;
  poloIzquierda: string;
  poloDerecha: string;
  atributos: Record<Capa1Rango, string>;
  respuestas: Record<Capa1Rango, string>;
};

export const CAPA1_AREAS: readonly Capa1AreaDef[] = [
  {
    id: "personal-mental",
    label: "Personal/Mental",
    framing: "Ser vs. deber ser",
    pregunta:
      "¿Tu diálogo interno te impulsa hacia quien quieres ser, o te frena para proteger quien crees que debes ser?",
    poloIzquierda: "Me frena constantemente",
    poloDerecha: "Me impulsa a crecer",
    atributos: {
      bajo: "Despertar",
      medio: "Transición",
      alto: "Dirección",
    },
    respuestas: {
      bajo: "Con {{score}} en tu mundo mental, hay más ruido que señal. Eso no es un defecto — es el punto de partida de casi todos los que terminan construyendo algo real.",
      medio:
        "{{score}} en tu mente. Hay momentos de claridad y momentos de niebla. Estás en transición — lo que falta no es información, es consistencia.",
      alto: "{{score}} en tu mundo interno. Tienes brújula. El trabajo ahora es mantenerla calibrada cuando el entorno intenta desviarte.",
    },
  },
  {
    id: "fisica-salud",
    label: "Física/Salud",
    framing: "Aliado vs. peso",
    pregunta:
      "¿Tu cuerpo es un aliado que te da energía para construir lo que quieres, o es un peso que cargas sin atender?",
    poloIzquierda: "Un peso que cargo",
    poloDerecha: "Mi principal aliado",
    atributos: {
      bajo: "Base",
      medio: "Proceso",
      alto: "Vitalidad",
    },
    respuestas: {
      bajo: "{{score}} en salud. Tu cuerpo está pidiendo atención básica antes de cualquier otra cosa. Sin energía física, todo lo demás cuesta el doble.",
      medio:
        "{{score}} en tu cuerpo. Hay intención pero no consistencia. El sistema te va a ayudar a que lo que ya sabes que funciona, funcione de verdad.",
      alto: "{{score}} en salud. Tu cuerpo trabaja contigo. Eso es ventaja — úsala para construir en las áreas que más lo necesitan.",
    },
  },
  {
    id: "financiera",
    label: "Financiera",
    framing: "Construir vs. consumir",
    pregunta:
      "¿Tu relación con el dinero hoy te está acercando a la libertad que quieres, o estás consumiendo tu futuro sin notarlo?",
    poloIzquierda: "Consumiendo mi futuro",
    poloDerecha: "Construyendo libertad",
    atributos: {
      bajo: "Consciencia",
      medio: "Control",
      alto: "Construcción",
    },
    respuestas: {
      bajo: "{{score}} en finanzas. Sin mapa financiero, el dinero desaparece antes de que puedas decidir a dónde va. El primer paso no es ganar más — es ver con claridad.",
      medio:
        "{{score}}. Tienes control básico pero no estrategia. Estás administrando — todavía no estás construyendo.",
      alto: "{{score}} en finanzas. Tienes los fundamentos. La siguiente capa es que tu dinero trabaje con la misma intención que tú.",
    },
  },
  {
    id: "profesional-academica",
    label: "Profesional/Académica",
    framing: "Lugar correcto vs. lugar eficiente",
    pregunta:
      "¿Estás en el lugar correcto — uno que te acerca a quien quieres ser — o solo siendo muy eficiente en el lugar equivocado?",
    poloIzquierda: "Lugar equivocado",
    poloDerecha: "Lugar correcto",
    atributos: {
      bajo: "Exploración",
      medio: "Alineación",
      alto: "Propósito",
    },
    respuestas: {
      bajo: "{{score}} en tu trayectoria. Hay desconexión entre lo que haces y quien quieres ser. Eso no es fracaso — es información.",
      medio:
        "{{score}}. Hay algo ahí, pero no está completamente definido. Estás cerca del eje — lo que falta es claridad, no esfuerzo.",
      alto: "{{score}} en tu profesión. Estás en el lugar correcto. El trabajo ahora es profundizar, no buscar otra cosa.",
    },
  },
  {
    id: "social-relaciones",
    label: "Social/Relaciones",
    framing: "Acercar vs. alejar",
    pregunta:
      "¿Las personas con las que pasas más tiempo te acercan a quien quieres ser, o te mantienen donde ya estás?",
    poloIzquierda: "Me mantienen donde estoy",
    poloDerecha: "Me acercan a quien quiero ser",
    atributos: {
      bajo: "Reconocimiento",
      medio: "Selección",
      alto: "Red",
    },
    respuestas: {
      bajo: "{{score}} en relaciones. Eres el promedio de tu entorno — y hoy ese promedio no está sumando. Cambiar eso es posible, pero requiere verlo con honestidad.",
      medio:
        "{{score}}. Tienes personas valiosas pero el círculo no está completamente alineado. La calidad de tus relaciones define el techo de lo que puedes construir.",
      alto: "{{score}} en relaciones. Tu entorno te impulsa. Eso vale más de lo que parece — cuídalo.",
    },
  },
] as const;

export type Capa1AreaAnswer = {
  areaId: string;
  label: string;
  score: number;
  rango: Capa1Rango;
  atributo: string;
  respuestaCompleta: string;
};
