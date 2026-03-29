"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  CAPA1_AREAS,
  CAPA1_NIVEL_POR_RANGO,
  CAPA1_RANGO_COLORS,
  type Capa1AreaAnswer,
  type Capa1Rango,
  capa1InterpolateRespuesta,
  capa1RangoFromScore,
} from "@/lib/modulo01/capa1-flow-data";

const LS_NOMBRE = "eidos_nombre";

/** 0 intro · 1–5 áreas · 6 elegir avatar · 7 output */
type ScreenIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

function buildAnswer(
  areaIndex: number,
  score: number,
): Capa1AreaAnswer | null {
  const def = CAPA1_AREAS[areaIndex];
  if (!def) return null;
  const rango = capa1RangoFromScore(score);
  const atributo = def.atributos[rango];
  const respuestaCompleta = capa1InterpolateRespuesta(
    def.respuestas[rango],
    score,
  );
  return {
    areaId: def.id,
    label: def.label,
    score,
    rango,
    atributo,
    respuestaCompleta,
  };
}

function Capa1AvatarFigure() {
  return (
    <svg
      viewBox="0 0 200 240"
      className="mx-auto h-48 w-40 text-accent-cyan md:h-56 md:w-44"
      aria-hidden
    >
      <defs>
        <linearGradient id="capa1-avatar-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#C9A84C" stopOpacity="0.5" />
        </linearGradient>
      </defs>
      <circle
        cx="100"
        cy="72"
        r="36"
        fill="none"
        stroke="url(#capa1-avatar-glow)"
        strokeWidth="3"
        className="animate-pulse"
      />
      <path
        d="M100 112 L100 168 M70 140 L130 140 M100 168 L75 210 M100 168 L125 210"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="100" cy="72" r="8" fill="#22D3EE" opacity="0.85" />
    </svg>
  );
}

export default function Modulo01Capa1Page() {
  const router = useRouter();
  const nombreStore = useOnboardingStore((s) => s.nombre);

  const [screen, setScreen] = useState<ScreenIndex>(0);
  const [areaIndex, setAreaIndex] = useState(0);
  const [slider, setSlider] = useState(50);
  const [saved, setSaved] = useState<(Capa1AreaAnswer | null)[]>(() =>
    Array.from({ length: CAPA1_AREAS.length }, () => null),
  );
  const [pickedAreaIndex, setPickedAreaIndex] = useState<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const fromStore = nombreStore.trim();
    if (fromStore && !localStorage.getItem(LS_NOMBRE)?.trim()) {
      localStorage.setItem(LS_NOMBRE, fromStore);
    }
  }, [nombreStore]);

  const syncSliderToArea = useCallback((idx: number) => {
    setAreaIndex(idx);
    setSlider(50);
  }, []);

  const goToArea = useCallback(
    (idx: number) => {
      syncSliderToArea(idx);
      setScreen((idx + 1) as ScreenIndex);
    },
    [syncSliderToArea],
  );

  const answeredList = useMemo(() => {
    return saved
      .map((ans, idx) => (ans ? { ans, idx } : null))
      .filter(Boolean) as { ans: Capa1AreaAnswer; idx: number }[];
  }, [saved]);

  const omittedCount = useMemo(
    () => saved.filter((s) => s === null).length,
    [saved],
  );

  const profilePercent = useMemo(
    () => Math.round(((CAPA1_AREAS.length - omittedCount) / CAPA1_AREAS.length) * 100),
    [omittedCount],
  );

  const currentDef = areaIndex >= 0 ? CAPA1_AREAS[areaIndex] : null;
  const currentRango: Capa1Rango = capa1RangoFromScore(slider);
  const rangeColor = CAPA1_RANGO_COLORS[currentRango];
  const liveRespuesta = currentDef
    ? capa1InterpolateRespuesta(currentDef.respuestas[currentRango], slider)
    : "";

  const transitionStyle = {
    animation: "capa1-step 0.35s ease-out both",
  } as const;

  const startFlow = () => goToArea(0);

  const continuarArea = () => {
    const ans = buildAnswer(areaIndex, slider);
    setSaved((prev) => {
      const next = [...prev];
      next[areaIndex] = ans;
      return next;
    });
    if (areaIndex < CAPA1_AREAS.length - 1) {
      goToArea(areaIndex + 1);
    } else {
      setScreen(6);
    }
  };

  const omitirArea = () => {
    setSaved((prev) => {
      const next = [...prev];
      next[areaIndex] = null;
      return next;
    });
    if (areaIndex < CAPA1_AREAS.length - 1) {
      goToArea(areaIndex + 1);
    } else {
      setScreen(6);
    }
  };

  const pickArea = (idx: number) => {
    setPickedAreaIndex(idx);
    setScreen(7);
  };

  const pickedAnswer =
    pickedAreaIndex !== null ? saved[pickedAreaIndex] : null;

  const renderIntro = () => (
    <div className="flex flex-col gap-8" style={transitionStyle}>
      <div className="space-y-4 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-text-primary md:text-3xl">
          Tu mapa empieza aquí.
        </h1>
        <p className="text-base leading-relaxed text-text-primary/95 md:text-lg">
          Vamos a recorrer 5 áreas de tu vida. Para cada una, un solo slider.
          Sin respuestas correctas. Solo honestidad.
        </p>
        <p className="text-sm text-text-muted">
          Puedes omitir cualquier área.
        </p>
        <p className="text-sm font-medium text-accent-cyan">
          Tiempo estimado: ~3 minutos.
        </p>
      </div>
      <button
        type="button"
        onClick={startFlow}
        className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20"
      >
        Empezar
      </button>
      <p className="text-center text-xs leading-relaxed text-text-muted">
        Solo tú ves esto. Entre más honesto seas, más preciso será tu mapa.
      </p>
    </div>
  );

  const renderArea = () => {
    if (!currentDef) return null;
    const k = areaIndex + 1;
    return (
      <div className="flex flex-col gap-8" style={transitionStyle}>
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-text-muted">
            <span>
              {k}/{CAPA1_AREAS.length}
            </span>
            <span className="tabular-nums">{Math.round((k / CAPA1_AREAS.length) * 100)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-text-muted/20">
            <div
              className="h-full rounded-full bg-accent-cyan transition-all duration-300"
              style={{ width: `${(k / CAPA1_AREAS.length) * 100}%` }}
            />
          </div>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-accent-cyan">
            {currentDef.label}
          </p>
          <p className="mt-1 text-sm text-text-muted">{currentDef.framing}</p>
          <h2 className="mt-4 text-lg font-semibold leading-snug text-text-primary md:text-xl">
            {currentDef.pregunta}
          </h2>
        </div>

        <div className="space-y-2">
          <div className="relative pt-8">
            <div
              className="pointer-events-none absolute bottom-full left-0 z-10 mb-1 -translate-x-1/2 text-sm font-semibold tabular-nums"
              style={{ left: `${slider}%`, color: rangeColor }}
            >
              {slider}%
            </div>
            <input
              type="range"
              min={0}
              max={100}
              value={slider}
              onChange={(e) => setSlider(Number(e.target.value))}
              className="h-2 w-full cursor-pointer"
              style={{ accentColor: rangeColor }}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={slider}
              aria-label="Valor 0 a 100"
            />
          </div>
          <div className="flex justify-between gap-4 text-xs leading-snug text-text-muted">
            <span className="max-w-[45%] text-left">{currentDef.poloIzquierda}</span>
            <span className="max-w-[45%] text-right">{currentDef.poloDerecha}</span>
          </div>
        </div>

        <p
          className="min-h-[4.5rem] text-sm leading-relaxed transition-colors duration-200 md:text-base"
          style={{ color: rangeColor }}
        >
          {liveRespuesta}
        </p>

        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={continuarArea}
            className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20"
          >
            Continuar →
          </button>
          <button
            type="button"
            onClick={omitirArea}
            className="w-full py-3 text-sm text-text-muted transition-colors hover:text-text-primary"
          >
            Omitir por ahora
          </button>
        </div>
      </div>
    );
  };

  const renderPick = () => (
    <div className="flex flex-col gap-8" style={transitionStyle}>
      <div className="text-center">
        <h2 className="text-xl font-semibold text-text-primary md:text-2xl">
          Elige tu avatar
        </h2>
        <p className="mt-2 text-sm text-text-muted">
          Toca el área que mejor define tu mapa ahora.
        </p>
      </div>

      {answeredList.length === 0 ? (
        <p className="text-center text-text-muted">
          No registraste ninguna área. Vuelve atrás con el navegador o reinicia
          el flujo recargando.
        </p>
      ) : (
        <ul className="flex flex-col gap-3">
          {answeredList.map(({ ans, idx }) => (
            <li key={ans.areaId}>
              <button
                type="button"
                onClick={() => pickArea(idx)}
                className="w-full rounded-xl border border-text-muted/30 bg-bg-base px-4 py-4 text-left transition-colors hover:border-accent-cyan/50 hover:bg-accent-cyan/5"
              >
                <p className="font-medium text-text-primary">{ans.label}</p>
                <p className="mt-1 text-sm text-accent-gold">{ans.atributo}</p>
                <p className="mt-1 text-xs text-text-muted">Score: {ans.score}%</p>
              </button>
            </li>
          ))}
        </ul>
      )}

      {omittedCount > 0 ? (
        <p className="text-center text-sm text-text-muted">
          {omittedCount} área{omittedCount === 1 ? "" : "s"} omitida
          {omittedCount === 1 ? "" : "s"} — tu perfil está al {profilePercent}%.
        </p>
      ) : null}
    </div>
  );

  const renderOutput = () => {
    if (!pickedAnswer || pickedAreaIndex === null) return null;
    const nivel = CAPA1_NIVEL_POR_RANGO[pickedAnswer.rango];
    const nombreParaAvatar =
      (typeof window !== "undefined" &&
        localStorage.getItem(LS_NOMBRE)?.trim()) ||
      nombreStore.trim() ||
      "Jugador";
    const chroniclesName = `${nombreParaAvatar}Chronicles`;

    return (
      <div className="flex flex-col gap-10" style={transitionStyle}>
        <Capa1AvatarFigure />
        <div className="text-center">
          <p className="text-2xl font-semibold text-accent-gold md:text-3xl">
            {chroniclesName}
          </p>
        </div>

        <div className="grid gap-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 p-5">
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Nivel
            </p>
            <p className="text-lg font-semibold text-text-primary">{nivel}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Área
            </p>
            <p className="text-lg font-semibold text-text-primary">
              {pickedAnswer.label}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Atributo
            </p>
            <p className="text-lg font-semibold text-accent-gold">
              {pickedAnswer.atributo}
            </p>
          </div>
        </div>

        <p className="text-base leading-relaxed text-text-primary md:text-lg">
          {pickedAnswer.respuestaCompleta}
        </p>

        {omittedCount > 0 ? (
          <p className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-3 text-sm text-text-primary">
            Tu perfil está incompleto. Puedes completarlo en la próxima sesión.
          </p>
        ) : null}

        <button
          type="button"
          onClick={() => router.push("/dashboard")}
          className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20"
        >
          Continuar →
        </button>
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-bg-base px-6 py-12 text-text-primary md:px-10 md:py-16">
      <div className="mx-auto w-full max-w-xl">
        <div key={`${screen}-${areaIndex}`}>
          {screen === 0 && renderIntro()}
          {screen >= 1 && screen <= 5 && renderArea()}
          {screen === 6 && renderPick()}
          {screen === 7 && renderOutput()}
        </div>
      </div>
    </main>
  );
}
