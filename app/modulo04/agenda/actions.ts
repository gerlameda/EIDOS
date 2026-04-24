"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  createAgendaEvent,
  deleteAgendaEvent,
  updateAgendaEvent,
} from "@/lib/supabase/agenda";
import type { AgendaEvent, AgendaEventInput } from "@/types/agenda";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01][0-9]|2[0-3]):[0-5][0-9]$/;

function validate(
  input: AgendaEventInput,
): { ok: true; value: AgendaEventInput } | { ok: false; error: string } {
  const title = input.title.trim();
  if (!title) return { ok: false, error: "El título no puede estar vacío." };
  if (title.length > 200)
    return { ok: false, error: "Máximo 200 caracteres." };
  if (!DATE_RE.test(input.startDate))
    return { ok: false, error: "Fecha de inicio inválida." };
  if (input.endDate != null && !DATE_RE.test(input.endDate))
    return { ok: false, error: "Fecha de fin inválida." };
  if (input.endDate != null && input.endDate < input.startDate)
    return { ok: false, error: "La fecha de fin debe ser igual o posterior al inicio." };
  if (input.startTime != null && !TIME_RE.test(input.startTime))
    return { ok: false, error: "Hora de inicio inválida (usa HH:MM)." };
  if (input.endTime != null && !TIME_RE.test(input.endTime))
    return { ok: false, error: "Hora de fin inválida (usa HH:MM)." };
  if (
    input.startTime != null &&
    input.endTime != null &&
    (!input.endDate || input.endDate === input.startDate) &&
    input.endTime < input.startTime
  ) {
    return {
      ok: false,
      error: "La hora de fin debe ser posterior a la de inicio.",
    };
  }

  // Normaliza tags (trim + dedupe, descarta vacíos).
  const tags = Array.from(
    new Set(
      (input.tags ?? [])
        .map((t) => t.trim())
        .filter((t) => t.length > 0 && t.length <= 40),
    ),
  );

  return {
    ok: true,
    value: {
      title,
      startDate: input.startDate,
      endDate: input.endDate,
      startTime: input.startTime,
      endTime: input.endTime,
      tags,
      notes: input.notes?.trim() || null,
    },
  };
}

export async function createAgendaEventAction(
  input: AgendaEventInput,
): Promise<{ event: AgendaEvent | null; error: string | null }> {
  const check = validate(input);
  if (!check.ok) return { event: null, error: check.error };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await createAgendaEvent(user.id, check.value, supabase);
  if (result.event) revalidatePath("/modulo04", "layout");
  return result;
}

export async function updateAgendaEventAction(
  eventId: string,
  input: AgendaEventInput,
): Promise<{ event: AgendaEvent | null; error: string | null }> {
  const check = validate(input);
  if (!check.ok) return { event: null, error: check.error };

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const result = await updateAgendaEvent(user.id, eventId, check.value, supabase);
  if (result.event) revalidatePath("/modulo04", "layout");
  return result;
}

export async function deleteAgendaEventAction(
  eventId: string,
): Promise<boolean> {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const ok = await deleteAgendaEvent(user.id, eventId, supabase);
  if (ok) revalidatePath("/modulo04", "layout");
  return ok;
}
