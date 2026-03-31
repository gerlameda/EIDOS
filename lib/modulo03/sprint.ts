import type { CriticalHabit, VisionArea } from "@/types/modulo02";
import type { DayOfWeek, RutinaBase, SprintCommitment, TimeOfDay } from "@/types/modulo03";
import type { Modulo02Area } from "@/lib/modulo02/areas";
import { AREA_ORDER } from "@/lib/modulo02/areas";

const HORIZON_DAYS: Record<string, DayOfWeek[]> = {
  "6m": ["lun", "mar", "mié", "jue", "vie"],
  "1y": ["lun", "mié", "vie", "sáb"],
  "2-3y": ["lun", "mié", "vie"],
};

const DAY_LABEL: Record<DayOfWeek, string> = {
  lun: "lunes",
  mar: "martes",
  mié: "miércoles",
  jue: "jueves",
  vie: "viernes",
  sáb: "sábado",
  dom: "domingo",
};

function timePhrase(t: TimeOfDay): string {
  if (t === "mañana") return "por la mañana";
  if (t === "tarde") return "por la tarde";
  return "por la noche";
}

function formatDaysList(days: DayOfWeek[]): string {
  if (days.length === 0) return "esta semana";
  if (days.length === 1) return `los ${DAY_LABEL[days[0]]}`;
  const labels = days.map((d) => DAY_LABEL[d]);
  if (labels.length === 2) return `los ${labels[0]} y ${labels[1]}`;
  const head = labels.slice(0, -1).join(", ");
  return `los ${head} y ${labels[labels.length - 1]}`;
}

function habitArea(h: CriticalHabit): Modulo02Area {
  const a = h.area as Modulo02Area;
  return AREA_ORDER.includes(a) ? a : "mente";
}

function horizonForHabit(
  habit: CriticalHabit,
  visionAreas: VisionArea[],
): VisionArea["horizon"] {
  const a = habitArea(habit);
  const v = visionAreas.find((x) => x.area === a);
  return v?.horizon ?? "1y";
}

function timeForHabitName(habitName: string, rutina: RutinaBase): TimeOfDay {
  if (rutina.manana.habits.includes(habitName)) return "mañana";
  if (rutina.tarde.habits.includes(habitName)) return "tarde";
  return "noche";
}

export function generateSprintProposals(
  criticalHabits: CriticalHabit[],
  rutinaBase: RutinaBase,
  visionAreas: VisionArea[],
): SprintCommitment[] {
  const sorted = [...criticalHabits].sort((a, b) => a.priority - b.priority);
  return sorted.map((h) => {
    const hz = horizonForHabit(h, visionAreas);
    const days = [...(HORIZON_DAYS[hz] ?? HORIZON_DAYS["1y"])];
    const timeOfDay = timeForHabitName(h.habit, rutinaBase);
    const daysText = formatDaysList(days);
    const commitment = `Voy a ${h.habit} ${daysText} ${timePhrase(timeOfDay)}.`;
    return {
      habitPriority: h.priority,
      area: h.area,
      habit: h.habit,
      commitment,
      days,
      timeOfDay,
    };
  });
}
