/**
 * Evento de agenda del usuario (tabla `eidos_agenda_events`).
 *
 * Campos opcionales explicados:
 * - `endDate` null → evento de un solo día (usa `startDate`).
 * - `startTime` null → evento de día completo (sin horario).
 * - `endTime` null → solo tiene hora de inicio (ej. "a las 9am").
 * - `tags` siempre es array (puede venir vacío).
 * - `notes` null = sin notas.
 */
export interface AgendaEvent {
  id: string;
  userId: string;
  title: string;
  /** "YYYY-MM-DD" */
  startDate: string;
  /** "YYYY-MM-DD" o null si es un solo día. */
  endDate: string | null;
  /** "HH:MM" 24h, o null si es all-day. */
  startTime: string | null;
  endTime: string | null;
  tags: string[];
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** Payload de creación/edición — los campos vacíos vienen como null. */
export interface AgendaEventInput {
  title: string;
  startDate: string;
  endDate: string | null;
  startTime: string | null;
  endTime: string | null;
  tags: string[];
  notes: string | null;
}
