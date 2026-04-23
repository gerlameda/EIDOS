import type { HabitGroupKey } from "@/types/modulo04";
import type { Modulo02Area } from "@/lib/modulo02/areas";

/**
 * Tier de un área derivado del score:
 *  - ruinas:      0–34
 *  - desarrollo: 35–64
 *  - iluminada:  65–100
 * Las misiones se filtran por tier: el usuario sólo ve misiones
 * apropiadas a su nivel actual en cada área.
 */
export type AreaTier = "ruinas" | "desarrollo" | "iluminada";

export function tierFromScore(score: number | null | undefined): AreaTier {
  if (score == null || score < 35) return "ruinas";
  if (score < 65) return "desarrollo";
  return "iluminada";
}

/**
 * Una misión sugerida. Si `habitGroup` está definido, "Adoptar" crea un
 * UserHabit que aparece en el check-in diario; si no, es una misión
 * de tipo one-shot (por ahora sólo visual).
 */
export interface AreaMission {
  id: string; // estable: área + slug
  area: Modulo02Area;
  tier: AreaTier;
  title: string;
  description: string;
  xp: number;
  /** Si se adopta como hábito diario, a qué grupo pertenece. */
  habitGroup?: HabitGroupKey;
}

// Catálogo. Cada área × tier → 3 misiones concretas, accionables.
export const AREA_MISSIONS: readonly AreaMission[] = [
  // ─────────── SALUD (físico) ───────────
  {
    id: "salud:ruinas:caminar",
    area: "salud",
    tier: "ruinas",
    title: "Camina 15 min al día",
    description:
      "Sin dispositivos, sin destino. Sólo caminar. Es el mínimo viable para reconectar con tu cuerpo.",
    xp: 5,
    habitGroup: "fisicos",
  },
  {
    id: "salud:ruinas:hidratacion",
    area: "salud",
    tier: "ruinas",
    title: "Un vaso de agua al despertar",
    description:
      "Antes del café. Antes del teléfono. Una sola acción física que empieza el día bien.",
    xp: 3,
    habitGroup: "fisicos",
  },
  {
    id: "salud:ruinas:dormir",
    area: "salud",
    tier: "ruinas",
    title: "Apaga pantallas 30 min antes de dormir",
    description:
      "Tu cuerpo no puede recuperarse si lo bombardeas con luz azul hasta que apagas la lámpara.",
    xp: 5,
    habitGroup: "fisicos",
  },
  {
    id: "salud:desarrollo:entrenar",
    area: "salud",
    tier: "desarrollo",
    title: "Entrena 3×/semana · 30 min",
    description:
      "Fuerza, cardio o mezcla — lo que prefieras, pero que sea no-negociable en tu calendario.",
    xp: 10,
    habitGroup: "fisicos",
  },
  {
    id: "salud:desarrollo:horario",
    area: "salud",
    tier: "desarrollo",
    title: "Misma hora para dormir y despertar",
    description:
      "Tu ritmo circadiano es el multiplicador invisible. Sin consistencia horaria, el resto rinde la mitad.",
    xp: 8,
    habitGroup: "fisicos",
  },
  {
    id: "salud:desarrollo:comer",
    area: "salud",
    tier: "desarrollo",
    title: "Trackea lo que comes 5 días",
    description:
      "Sin juicio, sin dieta. Sólo ver qué estás eligiendo. La claridad vive antes del cambio.",
    xp: 8,
    habitGroup: "fisicos",
  },
  {
    id: "salud:iluminada:progresion",
    area: "salud",
    tier: "iluminada",
    title: "Progresión medible en entrenamiento",
    description:
      "Pesos, reps, tiempos. Si no mides, estás entrenando en automático. Salta al siguiente nivel.",
    xp: 15,
    habitGroup: "fisicos",
  },
  {
    id: "salud:iluminada:recovery",
    area: "salud",
    tier: "iluminada",
    title: "Protocolo de recuperación semanal",
    description:
      "Estiramiento, sauna, frío, masaje — uno de los cuatro, cada semana. Recuperar es entrenar.",
    xp: 12,
    habitGroup: "fisicos",
  },
  {
    id: "salud:iluminada:bloods",
    area: "salud",
    tier: "iluminada",
    title: "Análisis de sangre anual",
    description:
      "Tus marcadores son datos. Medir una vez al año te da señal de qué ajustar en el próximo ciclo.",
    xp: 20,
  },

  // ─────────── MENTE (personal/mental) ───────────
  {
    id: "mente:ruinas:journal",
    area: "mente",
    tier: "ruinas",
    title: "5 min de journal cada mañana",
    description:
      "Una hoja. Tres líneas. Qué sientes, qué piensas, qué vas a hacer. Vaciar la mente la libera.",
    xp: 5,
    habitGroup: "mentales",
  },
  {
    id: "mente:ruinas:respiracion",
    area: "mente",
    tier: "ruinas",
    title: "3 respiraciones conscientes al despertar",
    description:
      "Antes de ver el teléfono. 3 respiraciones profundas. Empezar despierto, no reactivo.",
    xp: 3,
    habitGroup: "espirituales",
  },
  {
    id: "mente:ruinas:pausa",
    area: "mente",
    tier: "ruinas",
    title: "Pausa de 30s antes de reaccionar",
    description:
      "Cuando sientas emoción fuerte — enojo, ansiedad, impulso — para 30s. La pausa es el músculo.",
    xp: 5,
    habitGroup: "mentales",
  },
  {
    id: "mente:desarrollo:meditar",
    area: "mente",
    tier: "desarrollo",
    title: "Meditar 10 min diarios",
    description:
      "Una app, una silla, un timer. Sin excusas. Es el gimnasio de la atención.",
    xp: 10,
    habitGroup: "espirituales",
  },
  {
    id: "mente:desarrollo:leer",
    area: "mente",
    tier: "desarrollo",
    title: "Leer 20 min/día — papel o ebook",
    description:
      "No redes. No artículos sueltos. Un libro de principio a fin. El contexto profundo construye mente.",
    xp: 8,
    habitGroup: "mentales",
  },
  {
    id: "mente:desarrollo:review",
    area: "mente",
    tier: "desarrollo",
    title: "Review semanal — viernes noche",
    description:
      "¿Qué aprendí, qué evité, qué cambio la semana que entra? 15 minutos. Una plantilla. Consistencia.",
    xp: 10,
    habitGroup: "mentales",
  },
  {
    id: "mente:iluminada:silencio",
    area: "mente",
    tier: "iluminada",
    title: "Un día de silencio al mes",
    description:
      "Sin redes, sin llamadas, sin hablar si puedes. El silencio expone lo que la velocidad esconde.",
    xp: 20,
  },
  {
    id: "mente:iluminada:terapia",
    area: "mente",
    tier: "iluminada",
    title: "Coaching o terapia semanal",
    description:
      "Un espacio externo donde tu mente es examinada por otro. El solo-tú tiene techo.",
    xp: 15,
  },
  {
    id: "mente:iluminada:direccion",
    area: "mente",
    tier: "iluminada",
    title: "Review trimestral de dirección",
    description:
      "¿Sigo en el camino que me importa? Una tarde cada 3 meses, en papel. Alineación > velocidad.",
    xp: 12,
  },

  // ─────────── RELACIONES (social) ───────────
  {
    id: "relaciones:ruinas:llamada",
    area: "relaciones",
    tier: "ruinas",
    title: "Una llamada por semana a alguien importante",
    description:
      "No texto, llamada. Padre, madre, amigo cercano. 10 min. La conexión no sobrevive sin voz.",
    xp: 8,
  },
  {
    id: "relaciones:ruinas:gracias",
    area: "relaciones",
    tier: "ruinas",
    title: "Agradece explícitamente a alguien cada día",
    description:
      "Específico, sin rellenar. 'Gracias por X, me sirvió porque Y.' Transforma tu calidad de presencia.",
    xp: 3,
  },
  {
    id: "relaciones:ruinas:comida",
    area: "relaciones",
    tier: "ruinas",
    title: "Una comida semanal con alguien — sin teléfono",
    description:
      "Mesa, ojos, conversación. Si el teléfono aparece, la intimidad desaparece. No-negociable.",
    xp: 10,
  },
  {
    id: "relaciones:desarrollo:mensaje",
    area: "relaciones",
    tier: "desarrollo",
    title: "Un mensaje a la semana a alguien que te formó",
    description:
      "Mentor, maestro, jefe pasado, amigo de la universidad. No dejes que las buenas raíces se sequen.",
    xp: 5,
  },
  {
    id: "relaciones:desarrollo:dificil",
    area: "relaciones",
    tier: "desarrollo",
    title: "Agenda la conversación difícil que estás evitando",
    description:
      "Sabes cuál es. Ponle fecha esta semana. La incomodidad es un peaje, no un muro.",
    xp: 15,
  },
  {
    id: "relaciones:desarrollo:ritual",
    area: "relaciones",
    tier: "desarrollo",
    title: "Ritual mensual con tu círculo cercano",
    description:
      "Cena, caminata, lo que sea. Recurrente. La intención agendada vence a la espontaneidad olvidada.",
    xp: 12,
  },
  {
    id: "relaciones:iluminada:mentoria",
    area: "relaciones",
    tier: "iluminada",
    title: "Mentorea activamente a alguien",
    description:
      "Una persona que vaya 2-3 pasos atrás de ti. 30 min al mes. Enseñar consolida lo que sabes.",
    xp: 15,
  },
  {
    id: "relaciones:iluminada:tres",
    area: "relaciones",
    tier: "iluminada",
    title: "Cuida 3 relaciones profundas activamente",
    description:
      "Identifícalas. Agéndalas mensualmente. Las relaciones profundas son infra, no serendipia.",
    xp: 20,
  },
  {
    id: "relaciones:iluminada:meeting",
    area: "relaciones",
    tier: "iluminada",
    title: "Agenda tus relaciones como meetings",
    description:
      "Calendarios no mienten. Si alguien importa, aparece en tu agenda. Sin eso, no importa de verdad.",
    xp: 10,
  },

  // ─────────── PROPÓSITO (profesional) ───────────
  {
    id: "proposito:ruinas:no-quiero",
    area: "proposito",
    tier: "ruinas",
    title: "Define qué NO quieres seguir haciendo",
    description:
      "Una lista corta. 3 cosas. Específicas. Saber qué no quieres es la mitad de saber hacia dónde.",
    xp: 8,
  },
  {
    id: "proposito:ruinas:focus",
    area: "proposito",
    tier: "ruinas",
    title: "Bloque de 30 min/día sin notificaciones",
    description:
      "Modo avión. Una sola tarea. El enfoque es un músculo atrofiado para la mayoría — empieza chico.",
    xp: 8,
    habitGroup: "mentales",
  },
  {
    id: "proposito:ruinas:pregunta",
    area: "proposito",
    tier: "ruinas",
    title: "Escribe la pregunta que te obsesiona",
    description:
      "La que te aparece en la ducha. La que no dejas de rumiar. Escribirla es el primer acto honesto.",
    xp: 5,
  },
  {
    id: "proposito:desarrollo:publica",
    area: "proposito",
    tier: "desarrollo",
    title: "Publica algo público cada mes",
    description:
      "Texto, demo, video, proyecto. Recibir feedback externo acelera 10× vs. rumiar en privado.",
    xp: 15,
  },
  {
    id: "proposito:desarrollo:aprendizaje",
    area: "proposito",
    tier: "desarrollo",
    title: "2h/semana de aprendizaje dirigido",
    description:
      "Específico a tu North Star, no random. Un curso, un libro técnico, un proyecto paralelo.",
    xp: 12,
    habitGroup: "mentales",
  },
  {
    id: "proposito:desarrollo:review",
    area: "proposito",
    tier: "desarrollo",
    title: "Review semanal: ¿avancé hacia mi propósito?",
    description:
      "Viernes, 5 min. Si cuatro semanas seguidas la respuesta es no, hay que cambiar algo.",
    xp: 10,
  },
  {
    id: "proposito:iluminada:ensena",
    area: "proposito",
    tier: "iluminada",
    title: "Enseña una vez al mes",
    description:
      "Artículo, charla, taller. Enseñar te obliga a estructurar lo tácito y lo convierte en activo.",
    xp: 18,
  },
  {
    id: "proposito:iluminada:profundo",
    area: "proposito",
    tier: "iluminada",
    title: "4h semanales de trabajo profundo sagradas",
    description:
      "Mismo día, mismo horario, nadie las toca. Es donde nace lo que nadie más puede hacer por ti.",
    xp: 20,
    habitGroup: "mentales",
  },
  {
    id: "proposito:iluminada:trimestre",
    area: "proposito",
    tier: "iluminada",
    title: "Review trimestral: ¿sigue siendo el lugar?",
    description:
      "Nada sagrado. Reevalúa si tu rol/proyecto/empresa sigue alineado. Quedarse por inercia cuesta.",
    xp: 15,
  },

  // ─────────── RECURSOS (finanzas) ───────────
  {
    id: "recursos:ruinas:tracking",
    area: "recursos",
    tier: "ruinas",
    title: "Anota cada gasto por 7 días",
    description:
      "Con la app que sea. Sin filtrar. El primer paso antes de cualquier presupuesto: ver la realidad.",
    xp: 8,
  },
  {
    id: "recursos:ruinas:ahorro",
    area: "recursos",
    tier: "ruinas",
    title: "Abre una cuenta de ahorro separada",
    description:
      "Distinta al gasto. Nombre claro: 'fondo emergencia'. Misma intención que 'separar para no tocar'.",
    xp: 10,
  },
  {
    id: "recursos:ruinas:networth",
    area: "recursos",
    tier: "ruinas",
    title: "Calcula tu net worth (aunque sea 0)",
    description:
      "Activos menos pasivos. Un número. Hoy. No puedes mejorar lo que no mides.",
    xp: 8,
  },
  {
    id: "recursos:desarrollo:presupuesto",
    area: "recursos",
    tier: "desarrollo",
    title: "Presupuesto mensual con categorías",
    description:
      "Ingresos, gastos fijos, variables, ahorro. Revisión mensual de 30 min. Es contabilidad básica.",
    xp: 12,
  },
  {
    id: "recursos:desarrollo:automatico",
    area: "recursos",
    tier: "desarrollo",
    title: "Apartar 10% automático al día de pago",
    description:
      "Transferencia automática. No decide tu fuerza de voluntad — decide la configuración.",
    xp: 15,
  },
  {
    id: "recursos:desarrollo:libro",
    area: "recursos",
    tier: "desarrollo",
    title: "Un libro de finanzas por trimestre",
    description:
      "Compounding, The Psychology of Money, Rich Dad... Uno por trimestre. Educación no es evento.",
    xp: 10,
    habitGroup: "mentales",
  },
  {
    id: "recursos:iluminada:portafolio",
    area: "recursos",
    tier: "iluminada",
    title: "Revisión mensual de portafolio",
    description:
      "Asignación, performance, rebalanceo si aplica. 30 min al mes. Mantén la consciencia sobre capital.",
    xp: 15,
  },
  {
    id: "recursos:iluminada:inversion",
    area: "recursos",
    tier: "iluminada",
    title: "Automatiza 30% al mes a inversión",
    description:
      "No es cuánto ganas, es cuánto guardas. Porcentaje fijo, automático, diversificado.",
    xp: 20,
  },
  {
    id: "recursos:iluminada:segunda",
    area: "recursos",
    tier: "iluminada",
    title: "Activa una segunda fuente de ingreso",
    description:
      "Inversión, freelance, producto, royalty. Depender de una sola fuente es fragilidad disfrazada.",
    xp: 25,
  },
] as const;

/** Devuelve las misiones de un área filtradas por el tier que toca. */
export function getMissionsForArea(
  area: Modulo02Area,
  tier: AreaTier,
): AreaMission[] {
  return AREA_MISSIONS.filter((m) => m.area === area && m.tier === tier);
}
