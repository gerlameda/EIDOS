export type Capa2QuestionFormat =
  | "multiple_choice"
  | "scale_1_5"
  | "slider_0_100";

export interface Capa2QuestionAnswer {
  areaId: string; // ej. "personal-mental"
  questionId: string; // ej. "p1"
  format: Capa2QuestionFormat;
  value: number; // multiple_choice: 0–3 (índice) | scale_1_5: 1–5 | slider_0_100: 0–100
  answeredAt: string; // ISO timestamp
}

export interface Capa2AreaStatus {
  areaId: string;
  questions: Capa2QuestionAnswer[];
  percentageScore: number | null; // null hasta que el usuario calibra
  completedAt: string | null; // null si no completó el área
}
