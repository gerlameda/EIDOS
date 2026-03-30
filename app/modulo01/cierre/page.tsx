"use client";

import Link from "next/link";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { EidosAvatar } from "@/components/avatar/EidosAvatar";
import { getDynamicNarrative, getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import { capa1GlobalNivelFromSaved } from "@/lib/modulo01/capa1-flow-data";
import {
  normalizeNombreUsuario,
  useOnboardingStore,
} from "@/store/onboardingStore";

export default function Modulo01CierrePage() {
  const router = useRouter();
  const nombre = useOnboardingStore((s) => s.nombre);
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const capa2Areas = useOnboardingStore((s) => s.capa2Areas);

  const globalNivel = useMemo(
    () => capa1GlobalNivelFromSaved(capa1Saved),
    [capa1Saved],
  );
  const scores = useMemo(
    () => getUnifiedAreaScores(capa1Saved, capa2Areas),
    [capa1Saved, capa2Areas],
  );
  const narrativa = useMemo(() => getDynamicNarrative(scores), [scores]);

  const hasAnyScore = scores.some((a) => a.score !== null);
  const allCompleted = capa2Areas.length > 0 && capa2Areas.every((a) => a.completedAt !== null);

  useEffect(() => {
    if (!allCompleted || capa2Areas.length === 0 || !hasAnyScore) {
      router.replace("/dashboard");
    }
  }, [allCompleted, capa2Areas.length, hasAnyScore, router]);

  if (!allCompleted || capa2Areas.length === 0 || !hasAnyScore) {
    return null;
  }

  const tier = globalNivel?.tier ?? "low";
  const nivelLabel = globalNivel?.nivelLabel ?? "—";
  const atributoGlobal = globalNivel?.atributoGlobal ?? "—";
  const nombreNormalizado = normalizeNombreUsuario(nombre);
  const headline = nombreNormalizado
    ? `${nombreNormalizado}, tu mapa está listo.`
    : "Tu mapa está listo.";

  return (
    <main className="min-h-screen bg-bg-base px-6 py-10 text-text-primary md:px-8 md:py-14">
      <div className="mx-auto flex w-full max-w-xl flex-col items-center gap-8">
        <h1 className="text-center text-2xl font-semibold text-text-primary">
          {headline}
        </h1>

        <EidosAvatar tier={tier} />

        <div className="grid w-full max-w-sm gap-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5 text-center">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Nivel</p>
            <p className="mt-1 text-lg font-semibold text-text-primary">{nivelLabel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">Atributo</p>
            <p className="mt-1 text-lg font-semibold text-accent-gold">
              {atributoGlobal}
            </p>
          </div>
        </div>

        <p className="line-clamp-2 max-w-md text-center text-sm italic text-text-muted md:text-base">
          {narrativa}
        </p>

        <Link
          href="/modulo02"
          className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 text-center font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20"
        >
          Comenzar Módulo 02 →
        </Link>
      </div>
    </main>
  );
}

