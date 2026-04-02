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

export interface DailyCheckin {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  habitsCompleted: MissionKey[];
  sleepOk: boolean;
  foodOk: boolean;
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
  sleepOk: boolean;
  completedCoreToday: boolean;
}
