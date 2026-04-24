import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { getAgendaEventsInRange } from "@/lib/supabase/agenda";
import AgendaClient from "./AgendaClient";

/**
 * Calendario mensual con eventos del usuario. La querystring `?m=YYYY-MM`
 * permite navegar a otros meses (default = mes actual).
 *
 * Cargamos los eventos que solapan con [primer día del mes, último día del mes]
 * y los pasamos al cliente, que se encarga de renderizar el grid, abrir modales,
 * y refrescar con router.refresh() tras crear/editar/borrar.
 */
function parseMonth(raw: string | undefined): { year: number; month: number } {
  // month es 1–12. Si raw no matchea, devolvemos el mes actual.
  const now = new Date();
  if (raw && /^\d{4}-(0[1-9]|1[0-2])$/.test(raw)) {
    const [y, m] = raw.split("-").map(Number);
    return { year: y, month: m };
  }
  return {
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  };
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function firstDayOfMonth(year: number, month: number): string {
  return `${year}-${pad(month)}-01`;
}

function lastDayOfMonth(year: number, month: number): string {
  // Día 0 del mes siguiente = último día del mes actual.
  const d = new Date(Date.UTC(year, month, 0));
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
}

function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

interface AgendaPageProps {
  searchParams: Promise<{ m?: string }>;
}

export default async function AgendaPage({ searchParams }: AgendaPageProps) {
  const { m } = await searchParams;
  const { year, month } = parseMonth(m);

  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const fromDate = firstDayOfMonth(year, month);
  const toDate = lastDayOfMonth(year, month);
  const events = await getAgendaEventsInRange(user.id, fromDate, toDate, supabase);

  return (
    <AgendaClient
      year={year}
      month={month}
      events={events}
      todayDate={todayISO()}
    />
  );
}
