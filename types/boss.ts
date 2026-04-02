export type BossPhase = "intimidando" | "herido" | "desesperado";

export interface Boss {
  id: string;
  userId: string;
  name: string;
  maxHp: number;
  currentHp: number;
  phase: BossPhase;
  deadline: string; // YYYY-MM-DD
  areaFocus: string; // área de vida del boss (ej. "fisica")
  coreAttack: string; // hábito principal que más daño hace
  tauntPhrases: {
    intimidando: string;
    herido: string;
    desesperado: string;
  };
  defeated: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BossAttack {
  missionKey: string;
  damage: number;
  isCore: boolean;
  registeredAt: string;
}
