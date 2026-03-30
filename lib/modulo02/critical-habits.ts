import type { CriticalHabit, VisionArea, VisionHorizon } from "@/types/modulo02";

const HABIT_MAP: Record<
  string,
  Record<VisionHorizon, { habit: string; frequency: string; reason: string }>
> = {
  salud: {
    "6m": {
      habit: "Entrenamiento funcional",
      frequency: "4 veces por semana",
      reason: "Tu cuerpo necesita señales consistentes para cambiar en 6 meses.",
    },
    "1y": {
      habit: "Movimiento diario mínimo",
      frequency: "Todos los días",
      reason: "Un año es tiempo para construir una base sólida de energía.",
    },
    "2-3y": {
      habit: "Protocolo de recuperación",
      frequency: "3 veces por semana",
      reason: "La longevidad se construye con descanso tanto como con esfuerzo.",
    },
  },
  mente: {
    "6m": {
      habit: "Lectura o aprendizaje enfocado",
      frequency: "30 min diarios",
      reason: "La claridad mental se entrena como un músculo — con repetición diaria.",
    },
    "1y": {
      habit: "Journaling de reflexión",
      frequency: "4 veces por semana",
      reason: "Escribir organiza lo que la mente no puede sostener sola.",
    },
    "2-3y": {
      habit: "Práctica de meditación",
      frequency: "Todos los días",
      reason: "La transformación mental profunda requiere presencia sostenida.",
    },
  },
  relaciones: {
    "6m": {
      habit: "Conversación intencional",
      frequency: "2 veces por semana",
      reason: "Los vínculos se fortalecen en conversaciones que van más allá de lo superficial.",
    },
    "1y": {
      habit: "Tiempo dedicado a tu tribu",
      frequency: "1 vez por semana",
      reason: "La consistencia construye confianza mejor que la intensidad esporádica.",
    },
    "2-3y": {
      habit: "Carta o mensaje de apreciación",
      frequency: "1 vez al mes",
      reason: "Decir lo que importa, mientras importa.",
    },
  },
  proposito: {
    "6m": {
      habit: "Trabajo profundo en tu proyecto",
      frequency: "5 días a la semana",
      reason: "El propósito se revela en la acción, no solo en la reflexión.",
    },
    "1y": {
      habit: "Revisión semanal de dirección",
      frequency: "1 vez por semana",
      reason: "Un año sin brújula es un año perdido.",
    },
    "2-3y": {
      habit: "Proyecto de legado personal",
      frequency: "Avance mensual medible",
      reason: "Lo que construyes en 2 años puede durar décadas.",
    },
  },
  recursos: {
    "6m": {
      habit: "Revisión financiera semanal",
      frequency: "1 vez por semana",
      reason: "Lo que no mides no puedes cambiar.",
    },
    "1y": {
      habit: "Ahorro automático",
      frequency: "Mensual, sin excepciones",
      reason: "El hábito de pagarte primero transforma la relación con el dinero.",
    },
    "2-3y": {
      habit: "Inversión en activo generador",
      frequency: "Revisión trimestral",
      reason: "En 2–3 años puedes construir algo que trabaje por ti.",
    },
  },
};

export function calculateCriticalHabits(visionAreas: VisionArea[]): CriticalHabit[] {
  const scored = visionAreas.map((v) => {
    let score = 100 - v.sourceScore;
    if (v.horizon === "6m") score *= 1.4;
    return {
      vision: v,
      finalScore: score,
    };
  });

  const salud = scored.find((x) => x.vision.area === "salud");
  const saludForced = salud && salud.vision.sourceScore < 50 ? salud : null;

  const sorted = [...scored].sort((a, b) => b.finalScore - a.finalScore);
  const top3 = sorted.slice(0, 3);

  const selected = saludForced
    ? [saludForced, ...top3.filter((x) => x.vision.area !== "salud")].slice(0, 3)
    : top3;

  return selected.map((row, i) => {
    const preset = HABIT_MAP[row.vision.area]?.[row.vision.horizon] ?? {
      habit: "Hábito clave semanal",
      frequency: "3 veces por semana",
      reason: "Consistencia primero, perfección después.",
    };
    return {
      area: row.vision.area,
      habit: preset.habit,
      frequency: preset.frequency,
      reason: preset.reason,
      priority: (i + 1) as 1 | 2 | 3,
    };
  });
}

