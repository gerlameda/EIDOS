"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  HABIT_GROUP_LABEL,
  HABIT_GROUP_ORDER,
  HABIT_PRESETS,
} from "@/lib/modulo04/habitPresets";
import {
  addUserHabitAction,
  archiveUserHabitAction,
  upsertCheckinAction,
} from "../actions";
import { useBossStore } from "@/store/bossStore";
import { useDailyStore } from "@/store/dailyStore";
import type { HabitGroupKey, UserHabit } from "@/types/modulo04";

interface CheckinPageProps {
  todayDate: string;
  alreadyClosed: boolean;
  /** Últimos 7 días en formato "YYYY-MM-DD", ordenados ascendente (último = hoy). */
  recentDays: string[];
  /** Fechas dentro del rango con check-in registrado en Supabase. */
  completedDates: string[];
  /** Hábitos configurables del usuario (vacío si es su primera vez → entra en modo setup). */
  userHabits: UserHabit[];
  /** IDs de hábitos ya marcados en Supabase si el check-in ya estaba cerrado. */
  initialHabitIdsCompleted: string[];
}

type Mode = "setup" | "checkin" | "edit";

const DAYS_ES_SHORT = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
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

function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}

function dayLabel(iso: string): { name: string; num: string } {
  const d = parseISO(iso);
  return {
    name: DAYS_ES_SHORT[d.getUTCDay()],
    num: String(d.getUTCDate()),
  };
}

function longDateLabel(iso: string): string {
  const d = parseISO(iso);
  return `${DAYS_ES_SHORT[d.getUTCDay()].toLowerCase()} ${d.getUTCDate()} de ${MONTHS_ES_LONG[d.getUTCMonth()]}`;
}

function groupHabits(habits: UserHabit[]): Record<HabitGroupKey, UserHabit[]> {
  const by: Record<HabitGroupKey, UserHabit[]> = {
    fisicos: [],
    espirituales: [],
    mentales: [],
  };
  for (const h of habits) by[h.groupKey].push(h);
  for (const k of HABIT_GROUP_ORDER) {
    by[k].sort((a, b) => a.sortOrder - b.sortOrder);
  }
  return by;
}

export default function CheckinPage({
  todayDate,
  alreadyClosed,
  recentDays,
  completedDates,
  userHabits: initialUserHabits,
  initialHabitIdsCompleted,
}: CheckinPageProps) {
  // Lista local de hábitos: inicia con lo que vino del server y se actualiza
  // en vivo al agregar/archivar durante setup/edit (sin esperar al revalidate).
  const [habits, setHabits] = useState<UserHabit[]>(initialUserHabits);

  const {
    missions,
    checkinClosed,
    setCheckinClosed,
    habitStatuses,
    setHabitStatus,
    hydrateHabitStatuses,
  } = useDailyStore();
  const { incrementStreak } = useBossStore();

  /** IDs que el usuario respondió "sí" hoy — lo que se persiste en Supabase. */
  const habitIdsCompleted = useMemo(
    () =>
      Object.entries(habitStatuses)
        .filter(([, v]) => v === "yes")
        .map(([id]) => id),
    [habitStatuses],
  );

  const habitsByGroup = useMemo(() => groupHabits(habits), [habits]);

  // Gate: cada grupo necesita ≥1 hábito para poder hacer check-in.
  const groupsReady = HABIT_GROUP_ORDER.filter(
    (g) => habitsByGroup[g].length > 0,
  ).length;
  const setupComplete = groupsReady === HABIT_GROUP_ORDER.length;

  // Modo derivado: si no está listo el setup, forzamos modo setup.
  // Si el usuario oprime ✎, entra en "edit". Si oprime "Listo", vuelve a "checkin".
  const [editing, setEditing] = useState(false);
  // Evita que la vista "salte" de setup → checkin en cuanto el usuario tenga
  // 1 hábito por grupo. Para usuarios nuevos, esperamos a que pulsen
  // explícitamente "EMPEZAR CHECK-IN →" (útil si quieren seguir agregando más
  // hábitos mentales, espirituales o físicos antes de salir del setup).
  // Los que regresan — ya tienen hábitos configurados desde la primera vez —
  // entran directo a la vista de check-in.
  const [hasStartedCheckin, setHasStartedCheckin] = useState<boolean>(
    initialUserHabits.length > 0,
  );
  const mode: Mode =
    !setupComplete || !hasStartedCheckin
      ? "setup"
      : editing
        ? "edit"
        : "checkin";

  const completedMissions = missions.filter((m) => m.markedAt !== null);

  // Hidratamos el store con lo que venga de Supabase (solo una vez).
  useEffect(() => {
    if (initialHabitIdsCompleted.length > 0) {
      hydrateHabitStatuses(initialHabitIdsCompleted);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [saving, setSaving] = useState(false);
  const completedSet = useMemo(
    () => new Set(completedDates),
    [completedDates],
  );
  // Hoy también cuenta como "completo" si ya cerraste.
  const isTodayDone = alreadyClosed || checkinClosed;

  useEffect(() => {
    if (alreadyClosed) setCheckinClosed(true);
  }, [alreadyClosed, setCheckinClosed]);

  async function handleFinish() {
    setSaving(true);
    try {
      const ok = await upsertCheckinAction({
        date: todayDate,
        habitsCompleted: completedMissions.map((m) => m.key),
        habitIdsCompleted,
        // La reflexión vive en el journal — ya no la pedimos en el check-in,
        // pero mantenemos los campos en el payload por compatibilidad del
        // schema en Supabase (no queremos romper rows viejos).
        reflectionQuestion: "",
        reflectionAnswer: null,
      });
      if (!ok) return;
      incrementStreak();
      setCheckinClosed(true);
    } finally {
      setSaving(false);
    }
  }

  // Handlers de edición / setup
  const [habitError, setHabitError] = useState<string | null>(null);

  async function handleAddHabit(
    groupKey: HabitGroupKey,
    label: string,
    presetSlug: string | null,
  ): Promise<void> {
    const trimmed = label.trim();
    if (!trimmed) return;
    console.log("[EIDOS] addUserHabitAction →", {
      groupKey,
      label: trimmed,
      presetSlug,
    });
    const result = await addUserHabitAction({
      groupKey,
      label: trimmed,
      presetSlug,
    });
    console.log("[EIDOS] addUserHabitAction ←", result);
    if (result.error) {
      setHabitError(result.error);
      return;
    }
    if (result.habit) {
      setHabitError(null);
      const created = result.habit;
      // Actualizamos la lista local directamente — sin startTransition
      // compartido entre grupos. El transition global hacía que agregar
      // un hábito de Mental dejara "disabled" momentáneamente las otras
      // chips del mismo grupo, dando la impresión de que solo se podía
      // agregar uno a la vez.
      setHabits((prev) => [...prev, created]);
    }
  }
  async function handleArchiveHabit(habitId: string): Promise<void> {
    // Optimista: quita de la lista local antes de confirmar.
    setHabits((prev) => prev.filter((h) => h.id !== habitId));
    const ok = await archiveUserHabitAction(habitId);
    if (!ok) {
      // Revertimos: el hábito vuelve a aparecer.
      setHabits(initialUserHabits);
      setHabitError("No se pudo archivar el hábito.");
    }
  }

  const readOnly = mode === "checkin" && isTodayDone;

  // ── Render ────────────────────────────────────────────────────────────────

  if (mode === "setup") {
    return (
      <SetupView
        todayDate={todayDate}
        habitsByGroup={habitsByGroup}
        groupsReady={groupsReady}
        onAdd={handleAddHabit}
        onRemove={handleArchiveHabit}
        canContinue={setupComplete}
        errorMessage={habitError}
        onStartCheckin={() => setHasStartedCheckin(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0D0D14] pb-28 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0D0D14]/95 px-5 pb-3 pt-5 backdrop-blur-sm">
          <div className="grid grid-cols-[auto_1fr_auto] items-center">
            <Link
              href="/modulo04"
              aria-label="Cerrar"
              className="text-xl text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
            >
              ×
            </Link>
            <h1 className="text-center text-xs font-semibold tracking-[0.24em] text-[rgba(240,237,232,0.7)]">
              {mode === "edit" ? "EDITAR HÁBITOS" : "TU DÍA"}
            </h1>
            {mode === "edit" ? (
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-xs font-semibold tracking-[0.14em] text-[#22D3EE]"
              >
                LISTO
              </button>
            ) : !isTodayDone ? (
              <button
                type="button"
                aria-label="Editar hábitos"
                onClick={() => setEditing(true)}
                className="text-sm text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
              >
                ✎
              </button>
            ) : (
              <span aria-hidden className="w-5" />
            )}
          </div>
        </div>

        {/* Date scroll */}
        <div className="px-5 pt-2">
          <div
            className="flex snap-x snap-mandatory items-end gap-2 overflow-x-auto pb-2"
            style={{ scrollbarWidth: "none" }}
          >
            {recentDays.map((iso) => {
              const isToday = iso === todayDate;
              const completed = isToday
                ? isTodayDone
                : completedSet.has(iso);
              const { name, num } = dayLabel(iso);
              return (
                <div
                  key={iso}
                  className={`flex shrink-0 snap-start flex-col items-center rounded-full border px-3 py-2 text-center transition-colors ${
                    isToday
                      ? "border-[#F0EDE8]/60 bg-[#1A1A26]"
                      : "border-transparent bg-[#1A1A26]/40"
                  }`}
                  style={{ minWidth: isToday ? 62 : 54 }}
                  aria-current={isToday ? "date" : undefined}
                >
                  <span className="text-[10px] uppercase tracking-wider text-[rgba(240,237,232,0.5)]">
                    {name}
                  </span>
                  <span
                    className={`text-base font-medium ${
                      isToday
                        ? "text-[#F0EDE8]"
                        : "text-[rgba(240,237,232,0.8)]"
                    }`}
                  >
                    {num}
                  </span>
                  <span
                    aria-hidden
                    className="mt-1 h-1.5 w-1.5 rounded-full"
                    style={{
                      backgroundColor: completed
                        ? "#22D3EE"
                        : "rgba(240,237,232,0.18)",
                    }}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Title */}
        <div className="px-5 pt-6">
          <h2 className="text-2xl font-semibold leading-tight">
            {mode === "edit"
              ? "Ajusta tus hábitos"
              : readOnly
                ? `${capitalizar(longDateLabel(todayDate))} — día cerrado`
                : `¿Cómo cerramos el ${longDateLabel(todayDate)}?`}
          </h2>
          {mode === "edit" ? (
            <p className="mt-2 text-sm text-[rgba(240,237,232,0.6)]">
              Selecciona cuáles quieres agregar a tu check-in para monitoreo
              diario. Toca × para archivar los que ya no uses.
            </p>
          ) : null}
        </div>

        {/* Sección: Misiones (solo en checkin mode) */}
        {mode === "checkin" ? (
          <Section title="MISIONES">
            {missions.length === 0 ? (
              <EmptyRow text="No hay misiones para hoy." />
            ) : (
              missions.map((m) => (
                <ReadonlyRow
                  key={m.key}
                  label={m.habitText}
                  done={m.markedAt !== null}
                />
              ))
            )}
            <p className="px-1 pt-1 text-[11px] text-[rgba(240,237,232,0.4)]">
              Las misiones se marcan durante el día desde el Campo Base.
            </p>
          </Section>
        ) : null}

        {/* Secciones: Hábitos agrupados */}
        {HABIT_GROUP_ORDER.map((groupKey) => {
          const list = habitsByGroup[groupKey];
          return (
            <Section key={groupKey} title={HABIT_GROUP_LABEL[groupKey]}>
              {mode === "edit" ? (
                <EditableGroup
                  groupKey={groupKey}
                  habits={list}
                  onAdd={handleAddHabit}
                  onRemove={handleArchiveHabit}
                />
              ) : list.length === 0 ? (
                <EmptyRow text="No hay hábitos en este grupo todavía." />
              ) : (
                list.map((h) => (
                  <ToggleRow
                    key={h.id}
                    label={h.label}
                    value={habitStatuses[h.id] ?? null}
                    onChange={(v) => setHabitStatus(h.id, v)}
                    disabled={readOnly}
                  />
                ))
              )}
            </Section>
          );
        })}

        {/* Resumen compacto cuando ya cerraste */}
        {readOnly ? (
          <div className="px-5 pt-4">
            <div className="rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-4 text-sm">
              <p>
                Completaste{" "}
                <span className="font-bold text-[#22D3EE]">
                  {completedMissions.length}
                </span>{" "}
                de {missions.length} misiones y{" "}
                <span className="font-bold text-[#22D3EE]">
                  {habitIdsCompleted.length}
                </span>{" "}
                de {habits.length} hábitos.
              </p>
              <p className="mt-1 text-xs text-[rgba(240,237,232,0.5)]">
                Mañana tienes otra oportunidad.
              </p>
            </div>
            <Link
              href="/modulo04/journal"
              className="mt-3 block w-full rounded-xl bg-[#22D3EE] py-3 text-center text-sm font-bold text-[#0D0D14]"
            >
              Escribir en el journal →
            </Link>
            <Link
              href="/modulo04"
              className="mt-3 block text-center text-xs text-[rgba(240,237,232,0.5)] underline"
            >
              ← Volver al campo base
            </Link>
          </div>
        ) : null}
      </div>

      {/* CTA sticky solo en checkin mode (no en edit). */}
      {mode === "checkin" && !readOnly ? (
        <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#2A2A3A] bg-[#0D0D14]/95 backdrop-blur-sm">
          <div className="mx-auto flex w-full max-w-lg px-5 py-4">
            <button
              type="button"
              onClick={() => void handleFinish()}
              disabled={saving}
              className="w-full rounded-xl bg-[#F0EDE8] py-3 text-sm font-bold tracking-[0.14em] text-[#0D0D14] transition-opacity disabled:opacity-50"
            >
              {saving ? "GUARDANDO..." : "CERRAR MI DÍA"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

/* ───────────────────────────── Setup view ───────────────────────────── */

function SetupView({
  todayDate: _todayDate,
  habitsByGroup,
  groupsReady,
  onAdd,
  onRemove,
  canContinue,
  errorMessage,
  onStartCheckin,
}: {
  todayDate: string;
  habitsByGroup: Record<HabitGroupKey, UserHabit[]>;
  groupsReady: number;
  onAdd: (
    groupKey: HabitGroupKey,
    label: string,
    presetSlug: string | null,
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
  canContinue: boolean;
  errorMessage: string | null;
  onStartCheckin: () => void;
}) {
  // El CTA "Empezar check-in" recarga al modo checkin una vez que los 3 grupos
  // tengan ≥1 hábito. Como el modo se deriva del estado, simplemente forzamos
  // un re-render agregando una key arriba; pero como setupComplete ya bascula
  // el modo en el padre, aquí no necesitamos nada especial — el botón habilita
  // cuando canContinue es true y solo sirve de feedback visual/scroll.
  return (
    <div className="min-h-screen bg-[#0D0D14] pb-28 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#0D0D14]/95 px-5 pb-3 pt-5 backdrop-blur-sm">
          <div className="grid grid-cols-[auto_1fr_auto] items-center">
            <Link
              href="/modulo04"
              aria-label="Cerrar"
              className="text-xl text-[rgba(240,237,232,0.7)] hover:text-[#F0EDE8]"
            >
              ×
            </Link>
            <h1 className="text-center text-xs font-semibold tracking-[0.24em] text-[rgba(240,237,232,0.7)]">
              EMPIEZA CON LO BÁSICO
            </h1>
            <span aria-hidden className="w-5" />
          </div>
        </div>

        {/* Hero */}
        <div className="px-5 pt-6">
          <h2 className="text-2xl font-semibold leading-tight">
            Define los hábitos de tu check-in
          </h2>
          <p className="mt-2 text-sm text-[rgba(240,237,232,0.7)]">
            Selecciona cuáles quieres agregar a tu check-in para monitoreo
            diario. Necesitas al menos uno por grupo — puedes sumar o quitar
            después desde el ícono ✎.
          </p>

          {/* Progress */}
          <div className="mt-4 flex items-center gap-3">
            <div className="flex gap-1.5">
              {HABIT_GROUP_ORDER.map((g) => {
                const ready = habitsByGroup[g].length > 0;
                return (
                  <span
                    key={g}
                    aria-hidden
                    className="h-1.5 w-10 rounded-full"
                    style={{
                      backgroundColor: ready
                        ? "#22D3EE"
                        : "rgba(240,237,232,0.18)",
                    }}
                  />
                );
              })}
            </div>
            <p className="text-xs text-[rgba(240,237,232,0.5)]">
              {groupsReady}/{HABIT_GROUP_ORDER.length} grupos listos
            </p>
          </div>

          {/* Banner de error */}
          {errorMessage ? (
            <div className="mt-4 rounded-xl border border-[#EF4444]/40 bg-[#EF4444]/10 px-4 py-3 text-xs">
              <p className="font-semibold text-[#EF4444]">
                No se pudo guardar el hábito
              </p>
              <p className="mt-1 break-words text-[rgba(240,237,232,0.7)]">
                {errorMessage}
              </p>
              {/relation .* does not exist|eidos_user_habits/i.test(
                errorMessage,
              ) ? (
                <p className="mt-2 text-[rgba(240,237,232,0.7)]">
                  Parece que falta correr la migración{" "}
                  <code className="rounded bg-[#0D0D14] px-1 text-[#22D3EE]">
                    supabase/modulo04-habits-schema.sql
                  </code>{" "}
                  en Supabase SQL Editor.
                </p>
              ) : null}
            </div>
          ) : null}
        </div>

        {/* Secciones editables */}
        {HABIT_GROUP_ORDER.map((groupKey) => (
          <Section key={groupKey} title={HABIT_GROUP_LABEL[groupKey]}>
            <EditableGroup
              groupKey={groupKey}
              habits={habitsByGroup[groupKey]}
              onAdd={onAdd}
              onRemove={onRemove}
            />
          </Section>
        ))}
      </div>

      {/* CTA sticky */}
      <div className="fixed bottom-0 left-0 right-0 z-20 border-t border-[#2A2A3A] bg-[#0D0D14]/95 backdrop-blur-sm">
        <div className="mx-auto flex w-full max-w-lg px-5 py-4">
          <button
            type="button"
            disabled={!canContinue}
            className="w-full rounded-xl bg-[#F0EDE8] py-3 text-sm font-bold tracking-[0.14em] text-[#0D0D14] transition-opacity disabled:cursor-not-allowed disabled:bg-[#2A2A3A] disabled:text-[rgba(240,237,232,0.4)]"
            onClick={() => {
              if (canContinue) onStartCheckin();
            }}
          >
            {canContinue
              ? "EMPEZAR CHECK-IN →"
              : `FALTAN ${HABIT_GROUP_ORDER.length - groupsReady} GRUPO${HABIT_GROUP_ORDER.length - groupsReady === 1 ? "" : "S"}`}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────── Grupo editable ─────────────────────────── */

function EditableGroup({
  groupKey,
  habits,
  onAdd,
  onRemove,
}: {
  groupKey: HabitGroupKey;
  habits: UserHabit[];
  onAdd: (
    groupKey: HabitGroupKey,
    label: string,
    presetSlug: string | null,
  ) => Promise<void>;
  onRemove: (id: string) => Promise<void>;
}) {
  const [custom, setCustom] = useState("");
  // `adding` es LOCAL a cada EditableGroup — agregar un hábito mental
  // ya no bloquea los otros grupos ni el resto de chips del mismo grupo,
  // solo el botón "+" del input custom mientras esa llamada está en vuelo.
  const [adding, setAdding] = useState(false);

  const takenLabels = useMemo(
    () => new Set(habits.map((h) => h.label.toLowerCase().trim())),
    [habits],
  );
  const takenSlugs = useMemo(
    () =>
      new Set(
        habits
          .map((h) => h.presetSlug)
          .filter((s): s is string => typeof s === "string"),
      ),
    [habits],
  );

  const suggestions = HABIT_PRESETS.filter(
    (p) =>
      p.groupKey === groupKey &&
      !takenSlugs.has(p.slug) &&
      !takenLabels.has(p.label.toLowerCase()),
  );

  async function submitCustom() {
    const trimmed = custom.trim();
    if (!trimmed) return;
    setAdding(true);
    try {
      await onAdd(groupKey, trimmed, null);
      setCustom("");
    } finally {
      setAdding(false);
    }
  }

  return (
    <div className="space-y-2">
      {habits.length === 0 ? (
        <EmptyRow text="Todavía no tienes hábitos en este grupo." />
      ) : (
        habits.map((h) => (
          <RemovableRow
            key={h.id}
            label={h.label}
            onRemove={() => void onRemove(h.id)}
          />
        ))
      )}

      {/* Chips de sugerencias */}
      {suggestions.length > 0 ? (
        <div className="flex flex-wrap gap-2 pt-2">
          {suggestions.map((s) => (
            <button
              key={s.slug}
              type="button"
              onClick={() => void onAdd(s.groupKey, s.label, s.slug)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#22D3EE]/40 bg-[#1A1A26] px-3 py-1.5 text-xs text-[#F0EDE8] transition-colors hover:border-[#22D3EE] hover:bg-[#22D3EE]/10"
            >
              <span className="text-[#22D3EE]">+</span>
              {s.label}
            </button>
          ))}
        </div>
      ) : null}

      {/* Input custom */}
      <div className="flex items-center gap-2 pt-1">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              void submitCustom();
            }
          }}
          maxLength={80}
          placeholder="Agregar propio…"
          disabled={adding}
          className="flex-1 rounded-lg border border-[#2A2A3A] bg-[#0D0D14] px-3 py-2 text-sm text-[#F0EDE8] placeholder-[rgba(240,237,232,0.3)] outline-none focus:border-[#22D3EE] disabled:opacity-60"
        />
        <button
          type="button"
          onClick={() => void submitCustom()}
          disabled={!custom.trim() || adding}
          className="rounded-lg bg-[#22D3EE] px-3 py-2 text-sm font-bold text-[#0D0D14] transition-opacity disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
}

/* ───────────────────────────── Subcomponentes ───────────────────────────── */

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="px-5 pt-6">
      <p className="mb-2 text-[11px] font-semibold tracking-[0.24em] text-[rgba(240,237,232,0.5)]">
        {title}
      </p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  /** "yes" | "no" | null (sin tocar) */
  value: "yes" | "no" | null;
  onChange: (v: "yes" | "no") => void;
  disabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3">
      <p className="text-sm text-[#F0EDE8]">{label}</p>
      <div className="flex items-center gap-1.5">
        <ToggleButton
          active={value === "no"}
          onClick={() => {
            if (!disabled) onChange("no");
          }}
          disabled={disabled}
          icon="×"
          variant="no"
          aria-label="No"
        />
        <ToggleButton
          active={value === "yes"}
          onClick={() => {
            if (!disabled) onChange("yes");
          }}
          disabled={disabled}
          icon="✓"
          variant="yes"
          aria-label="Sí"
        />
      </div>
    </div>
  );
}

function ToggleButton({
  active,
  onClick,
  disabled,
  icon,
  variant,
  ...rest
}: {
  active: boolean;
  onClick: () => void;
  disabled?: boolean;
  icon: string;
  variant: "yes" | "no";
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const activeBg = variant === "yes" ? "#22D3EE" : "#C9A84C";
  const activeText = "#0D0D14";
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold transition-colors disabled:opacity-50"
      style={{
        backgroundColor: active ? activeBg : "#2A2A3A",
        color: active ? activeText : "rgba(240,237,232,0.7)",
      }}
      {...rest}
    >
      {icon}
    </button>
  );
}

function ReadonlyRow({ label, done }: { label: string; done: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3">
      <p className="text-sm text-[#F0EDE8]">{label}</p>
      <span
        aria-label={done ? "completada" : "pendiente"}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-base font-bold"
        style={{
          backgroundColor: done ? "#22D3EE" : "#2A2A3A",
          color: done ? "#0D0D14" : "rgba(240,237,232,0.4)",
        }}
      >
        {done ? "✓" : "○"}
      </span>
    </div>
  );
}

function RemovableRow({
  label,
  onRemove,
}: {
  label: string;
  onRemove: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3">
      <p className="text-sm text-[#F0EDE8]">{label}</p>
      <button
        type="button"
        onClick={onRemove}
        aria-label={`Archivar ${label}`}
        className="flex h-9 w-9 items-center justify-center rounded-lg text-base text-[rgba(240,237,232,0.5)] transition-colors hover:bg-[#2A2A3A] hover:text-[#EF4444]"
      >
        ×
      </button>
    </div>
  );
}

function EmptyRow({ text }: { text: string }) {
  return (
    <div className="rounded-xl border border-dashed border-[#2A2A3A] bg-[#1A1A26]/40 px-4 py-3">
      <p className="text-sm text-[rgba(240,237,232,0.5)]">{text}</p>
    </div>
  );
}

function capitalizar(s: string): string {
  if (!s) return s;
  return s.charAt(0).toUpperCase() + s.slice(1);
}
