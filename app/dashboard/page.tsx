"use client";

import Link from "next/link";
import { useMemo } from "react";
import { EidosAvatar } from "@/components/avatar/EidosAvatar";
import {
  CAPA1_ATRIBUTO_GLOBAL_POR_RANGO,
  CAPA1_NIVEL_POR_RANGO,
  CAPA1_RANGO_COLORS,
  capa1AvatarTierFromRango,
  capa1RangoFromScore,
} from "@/lib/modulo01/capa1-flow-data";
import {
  normalizeNombreUsuario,
  useOnboardingStore,
} from "@/store/onboardingStore";
import {
  getGlobalScore,
  getUnifiedAreaScores,
} from "@/lib/modulo01/area-scores";

const SESSION_KEY = "eidos-onboarding";

function nombreFromPersistedSession(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { state?: { nombre?: unknown } };
    const n = parsed?.state?.nombre;
    return typeof n === "string" ? n.trim() : "";
  } catch {
    return "";
  }
}

function barColorForScore(score: number): string {
  return CAPA1_RANGO_COLORS[capa1RangoFromScore(score)];
}

export default function DashboardPage() {
  const nombreStore = useOnboardingStore((s) => s.nombre);
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const capa2Areas = useOnboardingStore((s) => s.capa2Areas);

  const scores = useMemo(
    () => getUnifiedAreaScores(capa1Saved, capa2Areas),
    [capa1Saved, capa2Areas],
  );

  let nombreBase = nombreStore.trim();
  if (!nombreBase) {
    nombreBase = nombreFromPersistedSession();
  }
  if (!nombreBase) {
    nombreBase = "Jugador";
  }
  const chroniclesName = `${normalizeNombreUsuario(nombreBase)}Chronicles`;

  const globalScore = useMemo(() => getGlobalScore(scores), [scores]);

  const rangoGlobal = globalScore === null ? null : capa1RangoFromScore(globalScore);

  const tier = rangoGlobal ? capa1AvatarTierFromRango(rangoGlobal) : "low";
  const nivelLabel = rangoGlobal ? CAPA1_NIVEL_POR_RANGO[rangoGlobal] : "—";
  const atributoGlobal = rangoGlobal
    ? CAPA1_ATRIBUTO_GLOBAL_POR_RANGO[rangoGlobal]
    : "—";

  const profilePct = globalScore ?? 0;

  return (
    <main className="min-h-screen bg-bg-base px-5 py-8 pb-12 text-text-primary md:px-8 md:py-12">
      <div className="mx-auto w-full max-w-xl">
        <header className="mb-8 border-b border-accent-cyan/20 pb-6">
          <h1 className="text-xl font-semibold tracking-tight text-accent-gold md:text-2xl">
            {chroniclesName}
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-text-muted">
            <span className="font-medium text-text-primary">{nivelLabel}</span>
            <span className="mx-2 opacity-60">·</span>
            <span className="font-medium text-text-primary">
              {atributoGlobal}
            </span>
          </p>
        </header>

        <section
          className="mb-10 flex flex-col items-center"
          aria-labelledby="dashboard-avatar"
        >
          <h2 id="dashboard-avatar" className="sr-only">
            Avatar
          </h2>
          <EidosAvatar tier={tier} />
          <div className="mt-5 w-full max-w-sm space-y-4 text-center">
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">
                Nivel
              </p>
              <p className="mt-1 text-lg font-semibold text-text-primary">
                {nivelLabel}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-text-muted">
                Atributo
              </p>
              <p className="mt-1 text-lg font-semibold text-accent-gold">
                {atributoGlobal}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10" aria-labelledby="dashboard-areas">
          <h2
            id="dashboard-areas"
            className="mb-4 text-xs font-semibold uppercase tracking-wide text-accent-cyan"
          >
            Mis áreas
          </h2>
          <ul className="flex flex-col gap-5">
            {scores.map((area) => {
              const score = area.score;
              const hasData = score !== null;
              return (
                <li
                  key={`${area.source}-${area.areaId}`}
                  className="rounded-xl border border-accent-cyan/20 bg-accent-cyan/[0.04] px-4 py-3"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <p className="text-sm font-medium text-text-primary">
                      {area.label}
                    </p>
                    {hasData ? (
                      <span
                        className="shrink-0 text-sm font-semibold tabular-nums"
                        style={{ color: barColorForScore(score) }}
                      >
                        {score}%
                      </span>
                    ) : (
                      <span className="shrink-0 text-sm text-text-muted">
                        Sin datos aún
                      </span>
                    )}
                  </div>
                  {hasData ? (
                    <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-text-muted/20">
                      <div
                        className="h-full rounded-full transition-[width] duration-300"
                        style={{
                          width: `${score}%`,
                          backgroundColor: barColorForScore(score),
                        }}
                      />
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </section>

        <section aria-labelledby="dashboard-next">
          <h2 id="dashboard-next" className="sr-only">
            Siguiente misión
          </h2>
          <div className="rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5 md:p-6">
            <p className="text-sm leading-relaxed text-text-primary md:text-base">
              Tu perfil está al {profilePct}%. Completa las áreas restantes
              para desbloquear tu ruta crítica.
            </p>
            <Link
              href="/modulo01/capa2"
              className="mt-5 inline-flex w-full items-center justify-center rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 text-center text-sm font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 md:text-base"
            >
              Continuar construyendo →
            </Link>
          </div>
        </section>

        <section className="mt-6">
          <Link
            href="/modulo04"
            className="block w-full rounded-xl bg-[#22D3EE] py-4 text-center text-base font-bold tracking-wide text-[#0D0D14]"
          >
            ⚔️ Mi Juego →
          </Link>
        </section>
      </div>
    </main>
  );
}
