import type { RutinaBase, SprintCommitment } from "@/types/modulo03";
import type { DailyMission, MissionKey } from "@/types/modulo04";

export function buildMissionKey(
  source: "rutina" | "sprint",
  habitText: string,
): MissionKey {
  return `${source}:${habitText.toLowerCase().trim()}`;
}

export function buildDailyMissions(
  rutina: RutinaBase | null,
  sprint: SprintCommitment[],
  coreAttack: string,
  attacksToday: MissionKey[],
): DailyMission[] {
  const missions: DailyMission[] = [];
  const seen = new Set<string>();

  // Misiones de rutina base
  if (rutina) {
    const allHabits = [
      ...rutina.manana.habits,
      ...rutina.tarde.habits,
      ...rutina.noche.habits,
    ];
    for (const habit of allHabits) {
      const normalized = habit.toLowerCase().trim();
      if (seen.has(normalized)) continue;
      seen.add(normalized);
      const key = buildMissionKey("rutina", habit);
      const isCore =
        habit.toLowerCase().trim() === coreAttack.toLowerCase().trim();
      missions.push({
        key,
        habitText: habit,
        area: "general",
        source: "rutina",
        damageAmount: isCore ? 20 : 5,
        isCore,
        markedAt: attacksToday.includes(key) ? new Date().toISOString() : null,
      });
    }
  }

  // Misiones de sprint
  for (const commitment of sprint) {
    const normalized = commitment.habit.toLowerCase().trim();
    if (seen.has(normalized)) continue;
    seen.add(normalized);
    const key = buildMissionKey("sprint", commitment.habit);
    const isCore =
      commitment.habit.toLowerCase().trim() ===
      coreAttack.toLowerCase().trim();
    missions.push({
      key,
      habitText: commitment.habit,
      area: "general",
      source: "sprint",
      damageAmount: isCore ? 20 : 5,
      isCore,
      markedAt: attacksToday.includes(key) ? new Date().toISOString() : null,
    });
  }

  return missions;
}

export function calculateTotalDamage(missions: DailyMission[]): number {
  return missions
    .filter((m) => m.markedAt !== null)
    .reduce((sum, m) => sum + m.damageAmount, 0);
}
