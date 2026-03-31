import type { CriticalHabit } from "@/types/modulo02";
import type { RutinaBase, TimeOfDay } from "@/types/modulo03";
import type { Modulo02Area } from "@/lib/modulo02/areas";
import { AREA_ORDER } from "@/lib/modulo02/areas";

const AREA_TIME_MAP: Record<Modulo02Area, TimeOfDay> = {
  salud: "mañana",
  mente: "mañana",
  relaciones: "tarde",
  proposito: "mañana",
  recursos: "tarde",
};

const BLOCK_ORDER: TimeOfDay[] = ["mañana", "tarde", "noche"];

function keyForTime(b: TimeOfDay): keyof RutinaBase {
  if (b === "mañana") return "manana";
  if (b === "tarde") return "tarde";
  return "noche";
}

function emptyRutina(): RutinaBase {
  return {
    manana: { timeOfDay: "mañana", habits: [] },
    tarde: { timeOfDay: "tarde", habits: [] },
    noche: { timeOfDay: "noche", habits: [] },
  };
}

function nextSlot(t: TimeOfDay): TimeOfDay {
  const i = BLOCK_ORDER.indexOf(t);
  return BLOCK_ORDER[(i + 1) % BLOCK_ORDER.length];
}

/** Resuelve área del hábito a Modulo02Area; por defecto mente. */
function habitArea(h: CriticalHabit): Modulo02Area {
  const a = h.area as Modulo02Area;
  return AREA_ORDER.includes(a) ? a : "mente";
}

/**
 * Distribuye hábitos en bloques; si un bloque supera 2 ítems,
 * mueve el de menor prioridad (número mayor) al siguiente bloque.
 */
export function generateRutinaBase(criticalHabits: CriticalHabit[]): RutinaBase {
  const habits = [...criticalHabits].sort((a, b) => a.priority - b.priority);
  const assignment: { habit: string; priority: 1 | 2 | 3; slot: TimeOfDay }[] =
    habits.map((h) => ({
      habit: h.habit,
      priority: h.priority,
      slot: AREA_TIME_MAP[habitArea(h)],
    }));

  const countIn = (slot: TimeOfDay) =>
    assignment.filter((x) => x.slot === slot).length;

  let safety = 0;
  while (safety++ < 50) {
    const overloaded = BLOCK_ORDER.find((s) => countIn(s) > 2);
    if (!overloaded) break;
    const inBlock = assignment
      .filter((x) => x.slot === overloaded)
      .sort((a, b) => b.priority - a.priority);
    const toMove = inBlock[0];
    if (!toMove) break;
    let next = nextSlot(toMove.slot);
    let guard = 0;
    while (countIn(next) >= 2 && guard++ < 4) {
      next = nextSlot(next);
    }
    toMove.slot = next;
  }

  const r = emptyRutina();
  for (const a of assignment) {
    const k = keyForTime(a.slot);
    r[k].habits.push(a.habit);
  }
  return r;
}
