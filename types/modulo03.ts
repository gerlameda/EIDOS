export type DayOfWeek = "lun" | "mar" | "mié" | "jue" | "vie" | "sáb" | "dom";

export type TimeOfDay = "mañana" | "tarde" | "noche";

export type SprintCommitment = {
  habitPriority: 1 | 2 | 3;
  area: string;
  habit: string;
  commitment: string;
  days: DayOfWeek[];
  timeOfDay: TimeOfDay;
};

export type Manifiesto = {
  lines: [string, string, string];
  createdAt: string;
};

export type RutinaBlock = {
  timeOfDay: TimeOfDay;
  habits: string[];
};

export type RutinaBase = {
  manana: RutinaBlock;
  tarde: RutinaBlock;
  noche: RutinaBlock;
};
