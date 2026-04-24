import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";
import type { AgendaEvent, AgendaEventInput } from "@/types/agenda";

function agendaClient(supabase?: SupabaseClient) {
  return supabase ?? createClient();
}

function rowToAgendaEvent(row: Record<string, unknown>): AgendaEvent {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    startDate: row.start_date as string,
    endDate: (row.end_date as string | null) ?? null,
    startTime: (row.start_time as string | null) ?? null,
    endTime: (row.end_time as string | null) ?? null,
    tags: ((row.tags as string[] | null) ?? []) as string[],
    notes: (row.notes as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

/**
 * Devuelve todos los eventos que se solapan con el rango [fromDate, toDate].
 * Un evento con `endDate` null cuenta como un solo día (start_date).
 *
 * Ambas fechas en formato "YYYY-MM-DD".
 */
export async function getAgendaEventsInRange(
  userId: string,
  fromDate: string,
  toDate: string,
  supabase?: SupabaseClient,
): Promise<AgendaEvent[]> {
  const client = agendaClient(supabase);

  // Un evento se solapa con el rango si:
  //   start_date <= toDate   AND   COALESCE(end_date, start_date) >= fromDate
  // Supabase no soporta COALESCE en filter(), así que hacemos dos queries OR.
  const { data, error } = await client
    .from("eidos_agenda_events")
    .select("*")
    .eq("user_id", userId)
    .lte("start_date", toDate)
    .or(`end_date.gte.${fromDate},and(end_date.is.null,start_date.gte.${fromDate})`)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true });

  if (error) {
    console.error("getAgendaEventsInRange error:", error);
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(rowToAgendaEvent);
}

/**
 * Próximos N eventos desde hoy (inclusive). Útil para la card del dashboard.
 */
export async function getUpcomingAgendaEvents(
  userId: string,
  fromDate: string,
  limit: number,
  supabase?: SupabaseClient,
): Promise<AgendaEvent[]> {
  const client = agendaClient(supabase);

  const { data, error } = await client
    .from("eidos_agenda_events")
    .select("*")
    .eq("user_id", userId)
    .gte("start_date", fromDate)
    .order("start_date", { ascending: true })
    .order("start_time", { ascending: true, nullsFirst: true })
    .limit(limit);

  if (error) {
    console.error("getUpcomingAgendaEvents error:", error);
    return [];
  }

  return ((data as Record<string, unknown>[]) ?? []).map(rowToAgendaEvent);
}

export async function createAgendaEvent(
  userId: string,
  payload: AgendaEventInput,
  supabase?: SupabaseClient,
): Promise<{ event: AgendaEvent | null; error: string | null }> {
  const client = agendaClient(supabase);

  const { data, error } = await client
    .from("eidos_agenda_events")
    .insert({
      user_id: userId,
      title: payload.title,
      start_date: payload.startDate,
      end_date: payload.endDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      tags: payload.tags,
      notes: payload.notes,
    })
    .select("*")
    .single();

  if (error || !data) {
    console.error("[EIDOS] createAgendaEvent error:", error);
    return {
      event: null,
      error: error?.message ?? "No se pudo guardar el evento.",
    };
  }

  return {
    event: rowToAgendaEvent(data as Record<string, unknown>),
    error: null,
  };
}

export async function updateAgendaEvent(
  userId: string,
  eventId: string,
  payload: AgendaEventInput,
  supabase?: SupabaseClient,
): Promise<{ event: AgendaEvent | null; error: string | null }> {
  const client = agendaClient(supabase);

  const { data, error } = await client
    .from("eidos_agenda_events")
    .update({
      title: payload.title,
      start_date: payload.startDate,
      end_date: payload.endDate,
      start_time: payload.startTime,
      end_time: payload.endTime,
      tags: payload.tags,
      notes: payload.notes,
    })
    .eq("id", eventId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error || !data) {
    console.error("[EIDOS] updateAgendaEvent error:", error);
    return {
      event: null,
      error: error?.message ?? "No se pudo actualizar el evento.",
    };
  }

  return {
    event: rowToAgendaEvent(data as Record<string, unknown>),
    error: null,
  };
}

export async function deleteAgendaEvent(
  userId: string,
  eventId: string,
  supabase?: SupabaseClient,
): Promise<boolean> {
  const client = agendaClient(supabase);

  const { error } = await client
    .from("eidos_agenda_events")
    .delete()
    .eq("id", eventId)
    .eq("user_id", userId);

  if (error) {
    console.error("deleteAgendaEvent error:", error);
    return false;
  }
  return true;
}
