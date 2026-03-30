import type { Modulo02Area } from "@/lib/modulo02/areas";

export type AnchorData = {
  headline: string;
  subtext: string;
};

type AnchorBands = {
  low: AnchorData;
  mid: AnchorData;
  high: AnchorData;
  top: AnchorData;
};

const ANCHOR_MAP: Record<Modulo02Area, AnchorBands> = {
  salud: {
    low: {
      headline: "Tu cuerpo ha sido segundo plano.",
      subtext: "Eso está a punto de cambiar.",
    },
    mid: {
      headline: "Tienes movimiento, pero sin estructura.",
      subtext: "El potencial está ahí.",
    },
    high: {
      headline: "Eres alguien que se mueve.",
      subtext: "Ahora falta que sea intencional.",
    },
    top: {
      headline: "Tu salud ya es un activo.",
      subtext: "La pregunta es cómo multiplicarla.",
    },
  },
  mente: {
    low: {
      headline: "Tu mente trabaja sin descanso.",
      subtext: "Pero aún sin dirección clara.",
    },
    mid: {
      headline: "Tienes curiosidad, te falta sistema.",
      subtext: "La materia prima ya existe.",
    },
    high: {
      headline: "Piensas bien. Falta consistencia.",
      subtext: "La disciplina mental se construye.",
    },
    top: {
      headline: "Tu mente es una ventaja.",
      subtext: "¿Qué problema grande merece ese foco?",
    },
  },
  relaciones: {
    low: {
      headline: "Las conexiones más importantes esperan.",
      subtext: "El siguiente paso es mostrarte.",
    },
    mid: {
      headline: "Tienes vínculos, falta profundidad.",
      subtext: "La calidad importa más que la cantidad.",
    },
    high: {
      headline: "Construyes relaciones que duran.",
      subtext: "Ahora define cuáles quieres cultivar.",
    },
    top: {
      headline: "Tu red es una fortaleza.",
      subtext: "¿Cómo la usas para crecer juntos?",
    },
  },
  proposito: {
    low: {
      headline: "Aún no encuentras el hilo conductor.",
      subtext: "Eso cambia cuando decides buscarlo.",
    },
    mid: {
      headline: "Hay dirección, pero poca claridad.",
      subtext: "Definirlo es el trabajo más importante.",
    },
    high: {
      headline: "Sabes hacia dónde vas.",
      subtext: "Falta anclar el por qué a acciones diarias.",
    },
    top: {
      headline: "Tu propósito ya orienta tus decisiones.",
      subtext: "El reto es protegerlo del ruido.",
    },
  },
  recursos: {
    low: {
      headline: "El dinero aún toma decisiones por ti.",
      subtext: "Eso cambia con un sistema, aunque sea pequeño.",
    },
    mid: {
      headline: "Tienes ingresos, falta estructura.",
      subtext: "La diferencia entre sobrevivir y construir.",
    },
    high: {
      headline: "Tu relación con el dinero es funcional.",
      subtext: "Ahora escala la estrategia.",
    },
    top: {
      headline: "Tienes control financiero real.",
      subtext: "¿Cuál es el siguiente nivel de impacto?",
    },
  },
};

export function getAnchorText(area: string, score: number): AnchorData {
  const key = area as Modulo02Area;
  const areaMap = ANCHOR_MAP[key] ?? ANCHOR_MAP.salud;
  if (score <= 35) return areaMap.low;
  if (score <= 60) return areaMap.mid;
  if (score <= 80) return areaMap.high;
  return areaMap.top;
}

