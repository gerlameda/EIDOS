"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState, useTransition } from "react";
import type { AreaScore } from "@/lib/modulo01/area-scores";
import {
  AREA_LABELS,
  AREA_ORDER,
  MODULO01_AREA_ID_BY_MODULO02,
  type Modulo02Area,
} from "@/lib/modulo02/areas";
import {
  getMissionsForArea,
  tierFromScore,
  type AreaMission,
} from "@/lib/modulo04/areaMissions";
import { addUserHabitAction } from "@/app/modulo04/actions";

const AREA_CONFIG: Record<
  Modulo02Area,
  { bioma: string; svgX: number; svgY: number }
> = {
  salud: { bioma: "Campos de Entrenamiento", svgX: 80, svgY: 70 },
  mente: { bioma: "Torre del Observador", svgX: 290, svgY: 65 },
  relaciones: { bioma: "El Jardín", svgX: 120, svgY: 155 },
  proposito: { bioma: "El Estudio", svgX: 200, svgY: 118 },
  recursos: { bioma: "Ciudad Mercantil", svgX: 310, svgY: 162 },
};

function getAreaState(score: number) {
  if (score >= 65)
    return {
      label: "Región activa",
      color: "#22D3EE",
      tier: "high" as const,
    };
  if (score >= 35)
    return {
      label: "En construcción",
      color: "#C9A84C",
      tier: "mid" as const,
    };
  return {
    label: "En ruinas — necesita atención",
    color: "#374151",
    tier: "low" as const,
  };
}

function scoreForArea(unified: AreaScore[], key: Modulo02Area): number {
  const id = MODULO01_AREA_ID_BY_MODULO02[key];
  const row = unified.find((s) => s.areaId === id);
  if (row?.score == null) return 0;
  return Math.min(100, Math.max(0, row.score));
}

type MapaClientProps = {
  unifiedScores: AreaScore[];
  globalScore: number | null;
};

/** Pares de áreas conectadas en el SVG (índices en AREA_ORDER). */
const SVG_EDGES: [Modulo02Area, Modulo02Area][] = [
  ["salud", "mente"],
  ["salud", "proposito"],
  ["mente", "proposito"],
  ["proposito", "relaciones"],
  ["proposito", "recursos"],
  ["relaciones", "recursos"],
  ["salud", "relaciones"],
];

export default function MapaClient({
  unifiedScores,
  globalScore,
}: MapaClientProps) {
  const [sheetArea, setSheetArea] = useState<Modulo02Area | null>(null);
  const [sheetEnter, setSheetEnter] = useState(false);
  const [adoptedIds, setAdoptedIds] = useState<Set<string>>(new Set());
  const [adoptErrors, setAdoptErrors] = useState<Record<string, string>>({});
  const [isAdopting, startAdopt] = useTransition();

  useEffect(() => {
    if (sheetArea) {
      const id = requestAnimationFrame(() => setSheetEnter(true));
      return () => cancelAnimationFrame(id);
    }
    // Cuando sheetArea pasa a null, closeSheet() ya bajó setSheetEnter(false)
    // antes de despachar el timeout — no hace falta tocarlo aquí y así
    // evitamos setState síncrono en efecto (React 19).
  }, [sheetArea]);

  const closeSheet = useCallback(() => {
    setSheetEnter(false);
    window.setTimeout(() => setSheetArea(null), 300);
  }, []);

  const adoptMission = useCallback((mission: AreaMission) => {
    if (!mission.habitGroup) return; // one-shots no se adoptan como hábito
    setAdoptErrors((prev) => {
      const next = { ...prev };
      delete next[mission.id];
      return next;
    });
    startAdopt(async () => {
      const res = await addUserHabitAction({
        groupKey: mission.habitGroup!,
        label: mission.title,
      });
      if (res.habit) {
        setAdoptedIds((prev) => new Set(prev).add(mission.id));
      } else if (res.error) {
        setAdoptErrors((prev) => ({ ...prev, [mission.id]: res.error! }));
      }
    });
  }, []);

  const areaRows = useMemo(
    () =>
      AREA_ORDER.map((key) => {
        const score = scoreForArea(unifiedScores, key);
        const state = getAreaState(score);
        return {
          key,
          label: AREA_LABELS[key],
          bioma: AREA_CONFIG[key].bioma,
          score,
          state,
        };
      }),
    [unifiedScores],
  );

  const sheetRow = sheetArea
    ? areaRows.find((r) => r.key === sheetArea)
    : null;

  // Misiones para el área abierta, filtradas por su tier actual.
  const sheetMissions = useMemo<AreaMission[]>(() => {
    if (!sheetRow) return [];
    const tier = tierFromScore(sheetRow.score);
    return getMissionsForArea(sheetRow.key, tier);
  }, [sheetRow]);

  return (
    <div className="px-5 py-6 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* Header */}
        <header className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-[18px] font-medium text-[#F0EDE8]">
              Tu Mundo
            </h1>
            <p className="mt-1 text-[12px] uppercase tracking-[0.08em] text-[#22D3EE]">
              Mapa de Áreas
            </p>
          </div>
          <div className="text-right">
            <p className="text-[24px] font-medium text-[#C9A84C]">
              {globalScore != null ? globalScore : "—"}
            </p>
            <p className="text-[11px] text-[rgba(240,237,232,0.45)]">
              nivel global
            </p>
          </div>
        </header>

        {/* SVG mapa */}
        <section className="overflow-hidden rounded-xl border border-[rgba(240,237,232,0.08)] bg-[#0D0D14]">
          <svg
            viewBox="0 0 380 220"
            className="h-auto w-full"
            role="img"
            aria-label="Mapa decorativo de las cinco áreas de vida"
          >
            <defs>
              <radialGradient id="map-glow-cyan" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.45" />
                <stop offset="100%" stopColor="#22D3EE" stopOpacity="0" />
              </radialGradient>
              <radialGradient id="map-glow-gold" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#C9A84C" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#C9A84C" stopOpacity="0" />
              </radialGradient>
            </defs>
            <rect width="380" height="220" fill="#0D0D14" />

            {SVG_EDGES.map(([a, b]) => {
              const A = AREA_CONFIG[a];
              const B = AREA_CONFIG[b];
              return (
                <line
                  key={`${a}-${b}`}
                  x1={A.svgX}
                  y1={A.svgY}
                  x2={B.svgX}
                  y2={B.svgY}
                  stroke="#1F2937"
                  strokeWidth="1"
                  strokeDasharray="3 4"
                />
              );
            })}

            {AREA_ORDER.map((key) => {
              const { svgX: cx, svgY: cy } = AREA_CONFIG[key];
              const score = scoreForArea(unifiedScores, key);
              const st = getAreaState(score);
              const showGlow = st.tier !== "low";
              const strokeOpacity =
                st.tier === "high" ? 0.4 : st.tier === "mid" ? 0.35 : 0.4;
              const strokeColor = st.tier === "low" ? "#374151" : st.color;
              const dotFill =
                st.tier === "low" ? "#374151" : st.color;
              const dotOpacity = st.tier === "low" ? 0.5 : 1;

              return (
                <g key={key}>
                  {showGlow && (
                    <ellipse
                      cx={cx}
                      cy={cy}
                      rx={58}
                      ry={42}
                      fill={
                        st.tier === "high"
                          ? "url(#map-glow-cyan)"
                          : "url(#map-glow-gold)"
                      }
                    />
                  )}
                  {/* Pulso rojo en áreas en ruinas — pide atención */}
                  {st.tier === "low" && (
                    <>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1.5"
                      >
                        <animate
                          attributeName="r"
                          values="8;22;8"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.65;0;0.65"
                          dur="2.4s"
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle
                        cx={cx}
                        cy={cy}
                        r={8}
                        fill="none"
                        stroke="#EF4444"
                        strokeWidth="1"
                        opacity="0.5"
                      >
                        <animate
                          attributeName="r"
                          values="8;26;8"
                          dur="2.4s"
                          begin="1.2s"
                          repeatCount="indefinite"
                        />
                        <animate
                          attributeName="opacity"
                          values="0.5;0;0.5"
                          dur="2.4s"
                          begin="1.2s"
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                  <ellipse
                    cx={cx}
                    cy={cy}
                    rx={50}
                    ry={34}
                    fill="transparent"
                    stroke={strokeColor}
                    strokeOpacity={strokeOpacity}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={dotFill}
                    fillOpacity={dotOpacity}
                  />
                  <rect
                    x={cx - 18}
                    y={cy - 52}
                    width={36}
                    height={18}
                    rx={4}
                    fill={st.color}
                  />
                  <text
                    x={cx}
                    y={cy - 40}
                    textAnchor="middle"
                    fill={st.tier === "low" ? "#F0EDE8" : "#0D0D14"}
                    fontSize="10"
                    fontWeight="700"
                  >
                    {score}
                  </text>
                </g>
              );
            })}
          </svg>
          <div
            className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 border-t border-[rgba(240,237,232,0.06)] bg-[#0D0D14] px-3 py-2 text-[10px] text-[rgba(240,237,232,0.55)]"
            style={{ borderTopWidth: "0.5px" }}
          >
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#22D3EE]"
                aria-hidden
              />
              Iluminada (&gt;65)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#C9A84C]"
                aria-hidden
              />
              En desarrollo (35–64)
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full bg-[#EF4444]"
                aria-hidden
              />
              En ruinas (&lt;35) — pide atención
            </span>
          </div>
        </section>

        {/* Grid cards */}
        <section className="grid grid-cols-2 gap-2">
          {areaRows.map(({ key, label, bioma, score, state }) => {
            const isRecursos = key === "recursos";
            return (
              <button
                key={key}
                type="button"
                onClick={() => setSheetArea(key)}
                className={`rounded-[12px] border border-[rgba(240,237,232,0.08)] bg-[#0D0D14] p-3 text-left transition-colors hover:border-[rgba(34,211,238,0.25)] ${
                  isRecursos ? "col-span-2" : ""
                }`}
                style={{ borderWidth: "0.5px", padding: "12px" }}
              >
                <div
                  className="-mx-3 -mt-3 mb-3 h-0.5 rounded-t-[12px]"
                  style={{ height: "2px", backgroundColor: state.color }}
                />
                {isRecursos ? (
                  <div className="flex flex-row items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <p
                        className="text-[11px] uppercase tracking-[0.06em] text-[rgba(240,237,232,0.45)]"
                        style={{ fontSize: "11px", letterSpacing: "0.06em" }}
                      >
                        {label}
                      </p>
                      <p
                        className="text-[13px] font-medium text-[#F0EDE8]"
                        style={{ fontSize: "13px", fontWeight: 500 }}
                      >
                        {bioma}
                      </p>
                      <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(240,237,232,0.08)]">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{
                            width: `${score}%`,
                            backgroundColor: state.color,
                          }}
                        />
                      </div>
                      <p
                        className="text-[12px] font-medium"
                        style={{
                          fontSize: "12px",
                          fontWeight: 500,
                          color: state.color,
                        }}
                      >
                        {score} / 100
                      </p>
                      <p
                        className="text-[10px] text-[rgba(240,237,232,0.45)]"
                        style={{ fontSize: "10px" }}
                      >
                        {state.label}
                      </p>
                    </div>
                    <span className="shrink-0 rounded-md border border-[rgba(201,168,76,0.35)] bg-[rgba(201,168,76,0.12)] px-2 py-1 text-[9px] font-bold uppercase tracking-wider text-[#C9A84C]">
                      Boss activo
                    </span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p
                      className="text-[11px] uppercase tracking-[0.06em] text-[rgba(240,237,232,0.45)]"
                      style={{ fontSize: "11px", letterSpacing: "0.06em" }}
                    >
                      {label}
                    </p>
                    <p
                      className="text-[13px] font-medium text-[#F0EDE8]"
                      style={{ fontSize: "13px", fontWeight: 500 }}
                    >
                      {bioma}
                    </p>
                    <div className="h-[3px] w-full overflow-hidden rounded-full bg-[rgba(240,237,232,0.08)]">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${score}%`,
                          backgroundColor: state.color,
                        }}
                      />
                    </div>
                    <p
                      className="text-[12px] font-medium"
                      style={{
                        fontSize: "12px",
                        fontWeight: 500,
                        color: state.color,
                      }}
                    >
                      {score} / 100
                    </p>
                    <p
                      className="text-[10px] text-[rgba(240,237,232,0.45)]"
                      style={{ fontSize: "10px" }}
                    >
                      {state.label}
                    </p>
                  </div>
                )}
              </button>
            );
          })}
        </section>
      </div>

      {/* Bottom sheet */}
      {sheetArea && sheetRow && (
        <div
          className="fixed inset-0 z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="mapa-sheet-title"
        >
          <button
            type="button"
            className="absolute inset-0 bg-[rgba(0,0,0,0.6)]"
            aria-label="Cerrar panel"
            onClick={closeSheet}
          />
          <div className="pointer-events-none absolute inset-0 flex items-end justify-center">
            <div
              className={`pointer-events-auto relative w-full max-w-lg bg-[#0D0D14] transition-transform duration-300 ease-out ${
                sheetEnter ? "translate-y-0" : "translate-y-full"
              }`}
              style={{
                borderRadius: "16px 16px 0 0",
                padding: "24px",
                paddingTop: "12px",
              }}
            >
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[rgba(240,237,232,0.2)]" />
            <h2
              id="mapa-sheet-title"
              className="text-xl font-semibold text-[#F0EDE8]"
            >
              {sheetRow.label}
            </h2>
            <p className="mt-1 text-sm text-[rgba(240,237,232,0.55)]">
              {sheetRow.bioma}
            </p>
            <div className="mt-5 space-y-2">
              <div className="flex items-baseline justify-between gap-2">
                <span
                  className="text-lg font-medium"
                  style={{ color: sheetRow.state.color }}
                >
                  {sheetRow.score} / 100
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-[rgba(240,237,232,0.08)]">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${sheetRow.score}%`,
                    backgroundColor: sheetRow.state.color,
                  }}
                />
              </div>
              <p className="text-xs text-[rgba(240,237,232,0.45)]">
                {sheetRow.state.label}
              </p>
            </div>
            {/* Misiones sugeridas por tier actual */}
            <div className="mt-6">
              <div className="flex items-baseline justify-between">
                <h3 className="text-xs font-bold uppercase tracking-widest text-[#22D3EE]">
                  Misiones sugeridas
                </h3>
                <span className="text-[10px] uppercase tracking-wider text-[rgba(240,237,232,0.45)]">
                  {tierFromScore(sheetRow.score) === "ruinas"
                    ? "Empieza aquí"
                    : tierFromScore(sheetRow.score) === "desarrollo"
                      ? "Siguiente capa"
                      : "Mantén el vuelo"}
                </span>
              </div>

              <ul className="mt-3 max-h-[42vh] space-y-2 overflow-y-auto pr-1">
                {sheetMissions.map((m) => {
                  const adopted = adoptedIds.has(m.id);
                  const error = adoptErrors[m.id];
                  return (
                    <li
                      key={m.id}
                      className="rounded-lg border border-[rgba(240,237,232,0.08)] bg-[#14141C] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-[#F0EDE8]">
                            {m.title}
                          </p>
                          <p className="mt-1 text-xs leading-relaxed text-[rgba(240,237,232,0.55)]">
                            {m.description}
                          </p>
                          <p className="mt-2 text-[10px] uppercase tracking-wider text-[#C9A84C]">
                            +{m.xp} XP
                            {m.habitGroup && " · hábito diario"}
                          </p>
                          {error && (
                            <p className="mt-1 text-[11px] text-red-300">
                              {error}
                            </p>
                          )}
                        </div>
                        {m.habitGroup ? (
                          adopted ? (
                            <span className="shrink-0 rounded-md bg-[#22D3EE]/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#22D3EE]">
                              ✓ Adoptada
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => adoptMission(m)}
                              disabled={isAdopting}
                              className="shrink-0 rounded-md bg-[#22D3EE] px-2.5 py-1 text-[11px] font-bold text-[#0D0D14] transition hover:brightness-110 disabled:opacity-50"
                            >
                              Adoptar
                            </button>
                          )
                        ) : (
                          <span className="shrink-0 rounded-md border border-[rgba(240,237,232,0.15)] px-2 py-1 text-[10px] uppercase tracking-wider text-[rgba(240,237,232,0.55)]">
                            Proyecto
                          </span>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="mt-5 flex items-center gap-3">
              <Link
                href={`/modulo02/areas/${sheetRow.key}`}
                onClick={closeSheet}
                className="text-xs font-medium text-[rgba(240,237,232,0.55)] underline"
              >
                Ver visión del área
              </Link>
              <button
                type="button"
                onClick={closeSheet}
                className="ml-auto rounded-xl border border-[rgba(240,237,232,0.12)] px-4 py-2 text-sm font-medium text-[#F0EDE8]"
              >
                Cerrar
              </button>
            </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
