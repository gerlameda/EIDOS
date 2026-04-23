export type MissionSource = "rutina" | "sprint";

export type MissionKey = string;
// formato: "rutina:correr 5k" | "sprint:leer 30 min"

export interface DailyMission {
  key: MissionKey;
  habitText: string;
  area: string;
  source: MissionSource;
  damageAmount: number;
  isCore: boolean;
  markedAt: string | null;
}

/** Grupos en los que se clasifican los hábitos del check-in. */
export type HabitGroupKey = "fisicos" | "espirituales" | "mentales";

/** Hábito configurable del usuario (preset o custom) que se toglea en el check-in diario. */
export interface UserHabit {
  id: string;
  userId: string;
  groupKey: HabitGroupKey;
  label: string;
  /** Identificador estable cuando proviene de un preset (útil para upsert/migrate). */
  presetSlug: string | null;
  isPreset: boolean;
  sortOrder: number;
  archived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  habitsCompleted: MissionKey[];
  /** IDs de eidos_user_habits marcados como hechos ese día. */
  habitIdsCompleted: string[];
  reflectionQuestion: string;
  reflectionAnswer: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  content: string | null;
  oneWord: string | null;
  intentionTomorrow: string | null;
  bossId: string | null;
  streakDay: number;
  createdAt: string;
}

export type WordColor = "cyan" | "gold" | "muted";

export type CheckinStep = 1 | 2 | 3 | "summary";

export interface ReflectionContext {
  bossPhase: string;
  missionsCompleted: number;
  totalMissions: number;
  streakDays: number;
  /** Cuántos hábitos físicos marcó hoy (reemplaza la señal sleepOk vieja). */
  physicalHabitsCompleted: number;
  completedCoreToday: boolean;
}
