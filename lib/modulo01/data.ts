export type CapaUnoRangoId = "bajo" | "medio" | "alto";

/** Texto con marcador [X] donde se inserta el porcentaje. */
export type CapaUnoRespuestaRango = {
  min: number;
  max: number;
  template: string;
  atributo: string;
};

export type Area = {
  id: string;
  nombre: string;
  pregunta: string;
  respuestas: Record<CapaUnoRangoId, CapaUnoRespuestaRango>;
};

export type CapaUnoResultado = {
  areaId: string;
  nombre: string;
  pregunta: string;
  respuesta: string;
  atributo: string;
  rango: CapaUnoRangoId;
  porcentaje: number;
};

const PLACEHOLDER = "[X]";

function clampPorcentaje(n: number): number {
  if (!Number.isFinite(n)) return 0;
  return Math.min(100, Math.max(0, n));
}

function rangoParaPorcentaje(p: number): CapaUnoRangoId {
  if (p <= 40) return "bajo";
  if (p <= 70) return "medio";
  return "alto";
}

function insertarPorcentaje(template: string, porcentaje: number): string {
  const valor = String(Math.round(porcentaje));
  return template.split(PLACEHOLDER).join(valor);
}

export const areas: readonly Area[] = [
  {
    id: "personal-mental",
    nombre: "Personal / Mental",
    pregunta:
      "¿Qué tan seguido actúas desde quien eres, versus quien crees que deberías ser?",
    respuestas: {
      bajo: {
        min: 0,
        max: 40,
        template:
          "Un [X]% significa que tu diálogo interno todavía no es tuyo del todo. Eso es más común de lo que parece — y es exactamente lo que Módulo 01 empieza a cambiar.",
        atributo: "Despertar",
      },
      medio: {
        min: 41,
        max: 70,
        template:
          "Un [X]% dice que ya tienes voz propia, pero aún compite con el ruido externo. Esa batalla es el trabajo más importante que existe. Empecemos a ganarla.",
        atributo: "Búsqueda",
      },
      alto: {
        min: 71,
        max: 100,
        template:
          "Un [X]% de claridad mental es la base de todo lo demás. El reto ahora es que esa claridad no se quede en tu cabeza — que mueva cosas en el mundo real.",
        atributo: "Presencia",
      },
    },
  },
  {
    id: "fisica-salud",
    nombre: "Física / Salud",
    pregunta: "¿Tu cuerpo hoy es tu aliado o es un peso?",
    respuestas: {
      bajo: {
        min: 0,
        max: 40,
        template:
          "Un [X]% significa que tu instrumento más importante está operando por debajo de lo que mereces. No es juicio — es el dato más honesto del juego.",
        atributo: "Peso",
      },
      medio: {
        min: 41,
        max: 70,
        template:
          "Un [X]% dice que funciona, pero no te impulsa. Hay una diferencia entre no estar mal y estar bien. EIDOS trabaja en esa brecha.",
        atributo: "Resistencia",
      },
      alto: {
        min: 71,
        max: 100,
        template:
          "Un [X]% de energía física es una ventaja real. La pregunta es si la estás convirtiendo en resultados o solo en resistencia.",
        atributo: "Vitalidad",
      },
    },
  },
  {
    id: "financiera",
    nombre: "Financiera",
    pregunta: "¿Sabes exactamente a dónde va tu dinero cada mes?",
    respuestas: {
      bajo: {
        min: 0,
        max: 40,
        template:
          "Un [X]% significa que el dinero te está pasando — no al revés. Sin visibilidad no hay sistema. Esto es lo primero que cambia.",
        atributo: "Niebla",
      },
      medio: {
        min: 41,
        max: 70,
        template:
          "Un [X]% dice que tienes conciencia pero no control total. La diferencia entre los dos es un sistema, no más disciplina.",
        atributo: "Rastro",
      },
      alto: {
        min: 71,
        max: 100,
        template:
          "Un [X]% de claridad financiera es raro a tu edad. La siguiente pregunta es si esa claridad se está convirtiendo en patrimonio.",
        atributo: "Claridad",
      },
    },
  },
  {
    id: "profesional-academica",
    nombre: "Profesional / Académica",
    pregunta:
      "¿Qué tan seguido tomas decisiones profesionales desde lo que tú quieres, versus lo que otros esperan de ti?",
    respuestas: {
      bajo: {
        min: 0,
        max: 40,
        template:
          "Un [X]% significa que todavía estás jugando el juego de alguien más. Eso no es un defecto — es el punto de partida más honesto que puedes tener. Construimos desde aquí.",
        atributo: "Guión ajeno",
      },
      medio: {
        min: 41,
        max: 70,
        template:
          "Un [X]% es el rango más incómodo: ya sabes lo que quieres, pero todavía no lo estás viviendo del todo. Esa tensión es exactamente el combustible que necesita EIDOS.",
        atributo: "Transición",
      },
      alto: {
        min: 71,
        max: 100,
        template:
          "Un [X]% de claridad profesional es más raro de lo que crees. La pregunta ahora no es si lo sabes — es si lo estás construyendo con sistema. Eso es lo que sigue.",
        atributo: "Dirección",
      },
    },
  },
  {
    id: "social-relaciones",
    nombre: "Social / Relaciones",
    pregunta: "¿Tu círculo cercano te acerca o te aleja de quien quieres ser?",
    respuestas: {
      bajo: {
        min: 0,
        max: 40,
        template:
          "Un [X]% es una señal que pocos se atreven a ver con claridad. Nombrarlo ya es el primer movimiento.",
        atributo: "Soledad",
      },
      medio: {
        min: 41,
        max: 70,
        template:
          "Un [X]% dice que hay personas que suman y personas que drenan. EIDOS te ayuda a ver el patrón — y a decidir qué hacer con él.",
        atributo: "Selección",
      },
      alto: {
        min: 71,
        max: 100,
        template:
          "Un [X]% significa que ya elegiste bien tu entorno. El reto ahora es que tú también estés siendo el tipo de persona que ese círculo merece.",
        atributo: "Tribu",
      },
    },
  },
] as const;

const areaById = new Map<string, Area>(areas.map((a) => [a.id, a]));

/**
 * Resuelve el `id` de área a partir del texto guardado en onboarding (`areaPrioritaria`).
 */
export function getAreaIdFromOnboardingNombre(nombreOnboarding: string): string | null {
  const found = areas.find((a) => a.nombre === nombreOnboarding.trim());
  return found?.id ?? null;
}

/**
 * Capa 1: según área y porcentaje (0–100), devuelve texto con el % sustituido y el atributo de identidad.
 */
export function getCapaUnoResponse(
  areaId: string,
  porcentaje: number,
): CapaUnoResultado | null {
  const area = areaById.get(areaId);
  if (!area) return null;

  const p = clampPorcentaje(porcentaje);
  const rango = rangoParaPorcentaje(p);
  const bloque = area.respuestas[rango];

  return {
    areaId: area.id,
    nombre: area.nombre,
    pregunta: area.pregunta,
    respuesta: insertarPorcentaje(bloque.template, p),
    atributo: bloque.atributo,
    rango,
    porcentaje: p,
  };
}
