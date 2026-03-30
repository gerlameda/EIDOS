"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  CAPA1_RANGO_COLORS,
  type Capa1AreaAnswer,
  capa1RangoFromScore,
} from "@/lib/modulo01/capa1-flow-data";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import { useOnboardingStore } from "@/store/onboardingStore";

const AREAS = [
  {
    id: "personal-mental",
    label: "Personal / Mental",
    href: "/modulo01/capa2/personal-mental",
  },
  {
    id: "fisica-salud",
    label: "Física / Salud",
    href: "/modulo01/capa2/fisica-salud",
  },
  {
    id: "financiera",
    label: "Financiera",
    href: "/modulo01/capa2/financiera",
  },
  {
    id: "profesional-academica",
    label: "Profesional / Académica",
    href: "/modulo01/capa2/profesional-academica",
  },
  {
    id: "social-relaciones",
    label: "Social / Relaciones",
    href: "/modulo01/capa2/social-relaciones",
  },
] as const;

type EstadoCapa2 = "sin_explorar" | "en_progreso" | "completada";

function capa1ScoreForArea(
  capa1Saved: readonly (Capa1AreaAnswer | null)[],
  areaId: string,
): number | null {
  const item = capa1Saved.find((x) => x?.areaId === areaId);
  if (!item) return null;
  return item.score;
}

function estadoCapa2(
  capa2Areas: readonly Capa2AreaStatus[],
  areaId: string,
): EstadoCapa2 {
  const row = capa2Areas.find((a) => a.areaId === areaId);
  if (!row) return "sin_explorar";
  if (row.completedAt !== null) return "completada";
  return "en_progreso";
}

function colorSemaforoCapa1(score: number | null): string {
  if (score === null) return "rgba(240, 237, 232, 0.2)";
  const rango = capa1RangoFromScore(score);
  return CAPA1_RANGO_COLORS[rango];
}

export default function Modulo01Capa2HubPage() {
  const router = useRouter();
  const nombre = useOnboardingStore((s) => s.nombre);
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const capa2Areas = useOnboardingStore((s) => s.capa2Areas);

  const completadas = useMemo(
    () =>
      AREAS.filter((a) => estadoCapa2(capa2Areas, a.id) === "completada")
        .length,
    [capa2Areas],
  );

  const visibles = completadas >= 1 ? AREAS.length : 3;
  const areasMostrar = AREAS.slice(0, visibles);
  const allCompleted = completadas === AREAS.length;

  const titulo = nombre.trim()
    ? `${nombre.trim()}, tu perfil está en construcción.`
    : "Tu perfil está en construcción.";

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-10 pb-16 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-[480px]">
        <header className="mb-10 text-center">
          <h1 className="text-xl font-semibold leading-snug tracking-tight md:text-2xl">
            {titulo}
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-[rgba(240,237,232,0.5)] md:text-base">
            Explora un área a la vez. Entre más honesto seas, más preciso será tu
            mapa.
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {areasMostrar.map((area) => {
            const score = capa1ScoreForArea(capa1Saved, area.id);
            const estado = estadoCapa2(capa2Areas, area.id);
            const dotColor = colorSemaforoCapa1(score);
            const completada = estado === "completada";

            return (
              <li key={area.id}>
                <button
                  type="button"
                  onClick={() => router.push(area.href)}
                  className={
                    "flex w-full items-center gap-3 rounded-xl border px-4 py-4 text-left transition-colors duration-200 " +
                    "border-[rgba(240,237,232,0.1)] bg-transparent hover:bg-[rgba(240,237,232,0.04)] " +
                    (completada
                      ? "cursor-pointer border-[rgba(34,211,238,0.3)]"
                      : "")
                  }
                >
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: dotColor }}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1 text-base font-normal text-[#F0EDE8]">
                    {area.label}
                  </span>
                  {estado === "en_progreso" ? (
                    <span className="shrink-0 text-xs font-medium text-[#F59E0B]">
                      En progreso
                    </span>
                  ) : null}
                  {estado === "completada" ? (
                    <span className="shrink-0 text-xs font-medium text-[#22D3EE]">
                      ✓ Completa
                    </span>
                  ) : null}
                </button>
              </li>
            );
          })}
        </ul>

        {visibles < AREAS.length ? (
          <p className="mt-6 text-center text-xs text-[rgba(240,237,232,0.4)] md:text-sm">
            Completa un área para desbloquear las siguientes.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => router.push(allCompleted ? "/modulo01/cierre" : "/dashboard")}
          className="mt-12 w-full text-center text-sm text-[rgba(240,237,232,0.4)] transition-colors duration-200 hover:text-[rgba(240,237,232,0.55)]"
        >
          Guardar y salir
        </button>
      </div>
    </main>
  );
}
