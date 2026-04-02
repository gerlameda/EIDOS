import type { ReflectionContext } from "@/types/modulo04";

const QUESTIONS_CORE_COMPLETED = [
  "Atacaste el núcleo hoy. ¿Qué te hizo hacerlo de todas formas?",
  "Completaste tu misión principal. ¿Qué cambiaría si hicieras esto todos los días?",
  "Lo más difícil ya está hecho. ¿Qué lo hizo posible hoy?",
];

const QUESTIONS_STREAK = [
  "Llevas {n} días seguidos. ¿Qué está cambiando en ti?",
  "Racha de {n} días. ¿Qué versión de ti está emergiendo?",
];

const QUESTIONS_LOW_COMPLETION = [
  "Solo completaste {n} de {total} misiones. ¿Qué pasó hoy?",
  "El boss sobrevivió casi intacto. ¿Qué te lo impidió?",
];

const QUESTIONS_GENERIC = [
  "Cerraste otro día. ¿Qué aprendiste hoy sobre ti mismo?",
  "Un día más en el juego. ¿Qué fue diferente hoy?",
  "¿Qué decisión tomarías diferente mañana?",
];

export function selectReflectionQuestion(ctx: ReflectionContext): string {
  if (ctx.completedCoreToday) {
    return QUESTIONS_CORE_COMPLETED[
      Math.floor(Math.random() * QUESTIONS_CORE_COMPLETED.length)
    ];
  }

  if (ctx.streakDays >= 3) {
    const template =
      QUESTIONS_STREAK[Math.floor(Math.random() * QUESTIONS_STREAK.length)];
    return template.replace("{n}", String(ctx.streakDays));
  }

  const ratio =
    ctx.totalMissions > 0 ? ctx.missionsCompleted / ctx.totalMissions : 1;
  if (ratio < 0.4) {
    const template =
      QUESTIONS_LOW_COMPLETION[
        Math.floor(Math.random() * QUESTIONS_LOW_COMPLETION.length)
      ];
    return template
      .replace("{n}", String(ctx.missionsCompleted))
      .replace("{total}", String(ctx.totalMissions));
  }

  return QUESTIONS_GENERIC[
    Math.floor(Math.random() * QUESTIONS_GENERIC.length)
  ];
}
