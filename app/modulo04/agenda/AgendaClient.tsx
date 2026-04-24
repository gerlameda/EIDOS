"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  createAgendaEventAction,
  deleteAgendaEventAction,
  updateAgendaEventAction,
} from "./actions";
import type { AgendaEvent, AgendaEventInput } from "@/types/agenda";

interface Props {
  year: number;
  month: number; // 1–12
  events: AgendaEvent[];
  /** "YYYY-MM-DD" — hoy en zona local del servidor. */
  todayDate: string;
}

const MONTHS_ES_LONG = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

// Lunes-primero (estándar latinoamericano).
const WEEKDAYS_ES = ["L", "M", "M", "J", "V", "S", "D"];

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function monthQuery(year: number, month: number): string {
  return `?m=${year}-${pad(month)}`;
}

function addMonths(year: number, month: number, delta: number): {
  year: number;
  month: number;
} {
  // month es 1–12. Usamos Date UTC para overflow correcto.
  const d = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

/**
 * Retorna un array de 42 celdas (6 semanas × 7 días) para el grid mensual,
 * empezando el lunes anterior/igual al día 1 y terminando el domingo posterior.
 * Cada celda incluye la fecha ISO y si pertenece al mes "foco".
 */
function buildMonthGrid(
  year: number,
  month: number,
): Array<{ iso: string; day: number; inMonth: boolean }> {
  const first = new Date(Date.UTC(year, month - 1, 1));
  // getUTCDay: 0=Dom, 1=Lun, ..., 6=Sab. Para lunes-primero:
  const firstWeekday = first.getUTCDay(); // 0..6
  // Cuántos días retroceder para llegar al lunes anterior (o igual).
  const offset = firstWeekday === 0 ? 6 : firstWeekday - 1;

  const cells: Array<{ iso: string; day: number; inMonth: boolean }> = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(Date.UTC(year, month - 1, 1 - offset + i));
    cells.push({
      iso: `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`,
      day: d.getUTCDate(),
      inMonth: d.getUTCMonth() === month - 1,
    });
  }
  return cells;
}

/** Agrupa los eventos por cada día ISO que tocan (start_date..end_date). */
function bucketEventsByDay(
  events: AgendaEvent[],
): Record<string, AgendaEvent[]> {
  const buckets: Record<string, AgendaEvent[]> = {};
  for (const ev of events) {
    const start = ev.startDate;
    const end = ev.endDate ?? ev.startDate;
    // Iteramos día por día entre start y end.
    const s = new Date(start + "T00:00:00Z");
    const e = new Date(end + "T00:00:00Z");
    for (let d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
      const iso = `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
      (buckets[iso] ??= []).push(ev);
    }
  }
  return buckets;
}

function formatDayLong(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} de ${MONTHS_ES_LONG[m - 1]} de ${y}`;
}

export default function AgendaClient({
  year,
  month,
  events,
  todayDate,
}: Props) {
  const router = useRouter();

  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  // Tags únicos visibles en los eventos del mes — sirven como chips de filtro.
  const allTags = useMemo(() => {
    const set = new Set<string>();
    for (const ev of events) for (const t of ev.tags) set.add(t);
    return Array.from(set).sort((a, b) => a.localeCompare(b, "es"));
  }, [events]);

  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());

  const filteredEvents = useMemo(() => {
    if (activeTags.size === 0) return events;
    return events.filter((ev) => ev.tags.some((t) => activeTags.has(t)));
  }, [events, activeTags]);

  const byDay = useMemo(
    () => bucketEventsByDay(filteredEvents),
    [filteredEvents],
  );

  const prev = addMonths(year, month, -1);
  const next = addMonths(year, month, 1);

  // Modal state — cuando `editing` es un event, se abre en modo edit;
  // cuando es un objeto con solo startDate, se abre en create con esa fecha.
  const [modal, setModal] = useState<
    | null
    | { mode: "create"; startDate: string }
    | { mode: "edit"; event: AgendaEvent }
  >(null);

  function openCreate(iso: string) {
    setModal({ mode: "create", startDate: iso });
  }
  function openEdit(ev: AgendaEvent) {
    setModal({ mode: "edit", event: ev });
  }
  function closeModal() {
    setModal(null);
  }
  function afterMutate() {
    closeModal();
    router.refresh();
  }

  function toggleTag(tag: string) {
    setActiveTags((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] pb-24 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-3xl">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0D0D14]/95 px-5 pb-3 pt-5 backdrop-blur-sm">
          <div className="grid grid-cols-[auto_1fr_auto] items-center gap-3">
            <Link
              href="/modulo04"
              aria-label="Volver"
              className="text-xl text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
            >
              ←
            </Link>
            <h1 className="text-center text-xs font-semibold tracking-[0.24em] text-[rgba(240,237,232,0.7)]">
              AGENDA
            </h1>
            <button
              type="button"
              onClick={() => openCreate(todayDate)}
              className="rounded-lg bg-[#22D3EE] px-3 py-1.5 text-xs font-bold text-[#0D0D14]"
            >
              + Nuevo
            </button>
          </div>
        </div>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between px-5 pt-4">
          <Link
            href={`/modulo04/agenda${monthQuery(prev.year, prev.month)}`}
            className="rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-3 py-1.5 text-sm text-[rgba(240,237,232,0.8)] hover:text-[#F0EDE8]"
          >
            ← {MONTHS_ES_LONG[prev.month - 1]}
          </Link>
          <h2 className="text-xl font-semibold capitalize">
            {MONTHS_ES_LONG[month - 1]} {year}
          </h2>
          <Link
            href={`/modulo04/agenda${monthQuery(next.year, next.month)}`}
            className="rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-3 py-1.5 text-sm text-[rgba(240,237,232,0.8)] hover:text-[#F0EDE8]"
          >
            {MONTHS_ES_LONG[next.month - 1]} →
          </Link>
        </div>

        {/* Filtro de tags */}
        {allTags.length > 0 ? (
          <div className="flex flex-wrap gap-2 px-5 pt-4">
            <p className="w-full text-[11px] uppercase tracking-[0.2em] text-[rgba(240,237,232,0.5)]">
              Filtrar por tag
            </p>
            {allTags.map((tag) => {
              const on = activeTags.has(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className="rounded-full border px-3 py-1 text-xs transition-colors"
                  style={{
                    borderColor: on ? "#22D3EE" : "#2A2A3A",
                    backgroundColor: on ? "rgba(34,211,238,0.15)" : "#1A1A26",
                    color: on ? "#22D3EE" : "rgba(240,237,232,0.8)",
                  }}
                >
                  {on ? "✓ " : ""}
                  {tag}
                </button>
              );
            })}
            {activeTags.size > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTags(new Set())}
                className="rounded-full px-3 py-1 text-xs text-[rgba(240,237,232,0.5)] underline"
              >
                limpiar
              </button>
            ) : null}
          </div>
        ) : null}

        {/* Grid mensual */}
        <div className="px-5 pt-4">
          <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-semibold uppercase tracking-widest text-[rgba(240,237,232,0.45)]">
            {WEEKDAYS_ES.map((w, i) => (
              <div key={`${w}-${i}`} className="py-1.5">
                {w}
              </div>
            ))}
          </div>
          <div className="mt-1 grid grid-cols-7 gap-1">
            {cells.map((cell) => {
              const list = byDay[cell.iso] ?? [];
              const isToday = cell.iso === todayDate;
              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => openCreate(cell.iso)}
                  className="relative flex min-h-[76px] flex-col rounded-lg border p-1.5 text-left transition-colors hover:border-[#22D3EE]/60"
                  style={{
                    borderColor: isToday
                      ? "rgba(34,211,238,0.6)"
                      : cell.inMonth
                        ? "#2A2A3A"
                        : "rgba(42,42,58,0.3)",
                    backgroundColor: isToday
                      ? "rgba(34,211,238,0.06)"
                      : cell.inMonth
                        ? "#1A1A26"
                        : "rgba(26,26,38,0.35)",
                    opacity: cell.inMonth ? 1 : 0.5,
                  }}
                >
                  <span
                    className="mb-1 text-[11px] font-semibold tabular-nums"
                    style={{
                      color: isToday
                        ? "#22D3EE"
                        : cell.inMonth
                          ? "#F0EDE8"
                          : "rgba(240,237,232,0.4)",
                    }}
                  >
                    {cell.day}
                  </span>
                  {list.slice(0, 2).map((ev) => (
                    <span
                      key={ev.id}
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(ev);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.stopPropagation();
                          openEdit(ev);
                        }
                      }}
                      className="mb-0.5 block truncate rounded bg-[#22D3EE]/20 px-1 py-0.5 text-[10px] leading-tight text-[#22D3EE]"
                      title={ev.title}
                    >
                      {ev.startTime ? (
                        <span className="mr-0.5 tabular-nums">
                          {ev.startTime}
                        </span>
                      ) : null}
                      {ev.title}
                    </span>
                  ))}
                  {list.length > 2 ? (
                    <span className="text-[10px] text-[rgba(240,237,232,0.5)]">
                      +{list.length - 2} más
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        </div>

        {/* Lista de eventos del mes (debajo del grid, pensando en móvil) */}
        <div className="px-5 pt-6">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.24em] text-[rgba(240,237,232,0.5)]">
            Eventos de {MONTHS_ES_LONG[month - 1]}
          </p>
          {filteredEvents.length === 0 ? (
            <div className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#1A1A26]/40 px-4 py-5 text-sm text-[rgba(240,237,232,0.5)]">
              {activeTags.size > 0
                ? "Ningún evento con ese filtro."
                : "No hay eventos. Toca un día en el calendario o usa + Nuevo."}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredEvents.map((ev) => (
                <button
                  key={ev.id}
                  type="button"
                  onClick={() => openEdit(ev)}
                  className="flex w-full flex-col rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-3 text-left transition-colors hover:border-[#22D3EE]/60"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="font-medium text-[#F0EDE8]">{ev.title}</p>
                    <p className="shrink-0 text-xs tabular-nums text-[rgba(240,237,232,0.5)]">
                      {formatDayLong(ev.startDate)}
                      {ev.endDate && ev.endDate !== ev.startDate
                        ? ` → ${formatDayLong(ev.endDate)}`
                        : ""}
                    </p>
                  </div>
                  {(ev.startTime || ev.endTime) && (
                    <p className="mt-1 text-xs tabular-nums text-[rgba(240,237,232,0.7)]">
                      {ev.startTime ?? "—"}
                      {ev.endTime ? ` → ${ev.endTime}` : ""}
                    </p>
                  )}
                  {ev.tags.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1">
                      {ev.tags.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-[#22D3EE]/15 px-2 py-0.5 text-[10px] text-[#22D3EE]"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  {ev.notes ? (
                    <p className="mt-1.5 line-clamp-2 text-xs text-[rgba(240,237,232,0.6)]">
                      {ev.notes}
                    </p>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {modal ? (
        <EventModal
          initial={
            modal.mode === "create"
              ? {
                  title: "",
                  startDate: modal.startDate,
                  endDate: null,
                  startTime: null,
                  endTime: null,
                  tags: [],
                  notes: null,
                }
              : {
                  title: modal.event.title,
                  startDate: modal.event.startDate,
                  endDate: modal.event.endDate,
                  startTime: modal.event.startTime,
                  endTime: modal.event.endTime,
                  tags: modal.event.tags,
                  notes: modal.event.notes,
                }
          }
          eventId={modal.mode === "edit" ? modal.event.id : null}
          onClose={closeModal}
          onSaved={afterMutate}
          onDeleted={afterMutate}
        />
      ) : null}
    </div>
  );
}

/* ──────────────────────────── Modal ──────────────────────────── */

function EventModal({
  initial,
  eventId,
  onClose,
  onSaved,
  onDeleted,
}: {
  initial: AgendaEventInput;
  eventId: string | null;
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}) {
  const [title, setTitle] = useState(initial.title);
  const [startDate, setStartDate] = useState(initial.startDate);
  const [multiDay, setMultiDay] = useState<boolean>(initial.endDate != null);
  const [endDate, setEndDate] = useState<string>(
    initial.endDate ?? initial.startDate,
  );
  const [hasTime, setHasTime] = useState<boolean>(initial.startTime != null);
  const [startTime, setStartTime] = useState<string>(
    initial.startTime ?? "09:00",
  );
  const [hasEndTime, setHasEndTime] = useState<boolean>(
    initial.endTime != null,
  );
  const [endTime, setEndTime] = useState<string>(initial.endTime ?? "10:00");
  const [tagsInput, setTagsInput] = useState<string>(initial.tags.join(", "));
  const [notes, setNotes] = useState<string>(initial.notes ?? "");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function buildPayload(): AgendaEventInput {
    return {
      title: title.trim(),
      startDate,
      endDate: multiDay ? endDate : null,
      startTime: hasTime ? startTime : null,
      endTime: hasTime && hasEndTime ? endTime : null,
      tags: tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0),
      notes: notes.trim() || null,
    };
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const result = eventId
        ? await updateAgendaEventAction(eventId, payload)
        : await createAgendaEventAction(payload);
      if (result.error) {
        setError(result.error);
        return;
      }
      onSaved();
    } catch (err) {
      console.error("[EIDOS] agenda save threw:", err);
      setError("No pudimos guardar el evento.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!eventId) return;
    const confirmed = window.confirm(
      "¿Borrar este evento? No se puede deshacer.",
    );
    if (!confirmed) return;
    setSaving(true);
    try {
      const ok = await deleteAgendaEventAction(eventId);
      if (ok) onDeleted();
      else setError("No se pudo borrar el evento.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-30 flex items-end justify-center bg-[#0D0D14]/80 p-0 backdrop-blur-sm md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg overflow-y-auto rounded-t-2xl border border-[#2A2A3A] bg-[#1A1A26] p-5 md:rounded-2xl"
        style={{ maxHeight: "calc(100vh - 2rem)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {eventId ? "Editar evento" : "Nuevo evento"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            className="text-xl text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
          >
            ×
          </button>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs text-[rgba(240,237,232,0.6)]">
              Título
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={200}
              placeholder="Ej. Cena con María"
              className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-[rgba(240,237,232,0.6)]">
                Fecha
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] outline-none focus:border-[#22D3EE]"
              />
            </div>
            <div>
              <label className="mb-1 flex items-center justify-between text-xs text-[rgba(240,237,232,0.6)]">
                <span>Fecha fin</span>
                <input
                  type="checkbox"
                  checked={multiDay}
                  onChange={(e) => setMultiDay(e.target.checked)}
                  className="ml-2 accent-[#22D3EE]"
                  aria-label="Evento multi-día"
                />
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                disabled={!multiDay}
                min={startDate}
                className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] outline-none focus:border-[#22D3EE] disabled:opacity-40"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 flex items-center justify-between text-xs text-[rgba(240,237,232,0.6)]">
              <span>Horario</span>
              <input
                type="checkbox"
                checked={hasTime}
                onChange={(e) => {
                  setHasTime(e.target.checked);
                  if (!e.target.checked) setHasEndTime(false);
                }}
                className="ml-2 accent-[#22D3EE]"
                aria-label="Tiene horario"
              />
            </label>
            {hasTime ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="mb-1 text-[11px] text-[rgba(240,237,232,0.5)]">
                    Inicio
                  </p>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] outline-none focus:border-[#22D3EE]"
                  />
                </div>
                <div>
                  <p className="mb-1 flex items-center justify-between text-[11px] text-[rgba(240,237,232,0.5)]">
                    <span>Fin</span>
                    <input
                      type="checkbox"
                      checked={hasEndTime}
                      onChange={(e) => setHasEndTime(e.target.checked)}
                      className="ml-2 accent-[#22D3EE]"
                      aria-label="Tiene hora fin"
                    />
                  </p>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    disabled={!hasEndTime}
                    className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] outline-none focus:border-[#22D3EE] disabled:opacity-40"
                  />
                </div>
              </div>
            ) : (
              <p className="text-xs text-[rgba(240,237,232,0.4)]">
                Evento de día completo.
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs text-[rgba(240,237,232,0.6)]">
              Tags{" "}
              <span className="text-[rgba(240,237,232,0.4)]">
                (separa con comas)
              </span>
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="trabajo, personal, importante"
              className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-[rgba(240,237,232,0.6)]">
              Notas{" "}
              <span className="text-[rgba(240,237,232,0.4)]">(opcional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Detalles, link, ubicación…"
              className="w-full rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE]"
            />
          </div>

          {error ? (
            <p className="text-xs text-[#EF4444]">{error}</p>
          ) : null}
        </div>

        <div className="mt-5 flex items-center gap-2">
          {eventId ? (
            <button
              type="button"
              onClick={() => void handleDelete()}
              disabled={saving}
              className="rounded-lg border border-[#EF4444]/40 px-3 py-2 text-xs text-[#EF4444] transition-colors hover:bg-[#EF4444]/10 disabled:opacity-50"
            >
              Borrar
            </button>
          ) : null}
          <div className="flex-1" />
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="rounded-lg px-3 py-2 text-sm text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !title.trim()}
            className="rounded-lg bg-[#22D3EE] px-4 py-2 text-sm font-bold text-[#0D0D14] transition-opacity disabled:opacity-40"
          >
            {saving ? "Guardando…" : "Guardar"}
          </button>
        </div>
      </div>
    </div>
  );
}
