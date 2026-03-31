export interface EidosProfileRow {
  id: string;
  created_at: string;
  updated_at: string;
  nombre: string;
  nivel: number;
  area_prioritaria: string;
  capa1_saved: unknown;
  capa2_areas: unknown;
  vision_areas: unknown;
  critical_habits: unknown;
  manifiesto: unknown | null;
  rutina_base: unknown | null;
  sprint_commitments: unknown;
  modulo03_completed: boolean;
}
