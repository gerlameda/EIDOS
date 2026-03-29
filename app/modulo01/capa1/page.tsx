"use client";

import { useCallback, useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import {
  CAPA1_AREAS,
  CAPA1_RANGO_COLORS,
  type Capa1AreaAnswer,
  type Capa1AvatarTier,
  type Capa1Rango,
  capa1GlobalNivelFromSaved,
  capa1HighlightAnswer,
  capa1InterpolateRespuesta,
  capa1RangoFromScore,
} from "@/lib/modulo01/capa1-flow-data";

const ONBOARDING_SESSION_KEY = "eidos-onboarding";

function nombreFromPersistedOnboardingSession(): string {
  if (typeof window === "undefined") return "";
  try {
    const raw = sessionStorage.getItem(ONBOARDING_SESSION_KEY);
    if (!raw) return "";
    const parsed = JSON.parse(raw) as { state?: { nombre?: unknown } };
    const n = parsed?.state?.nombre;
    return typeof n === "string" ? n.trim() : "";
  } catch {
    return "";
  }
}

/** 0 intro · 1–5 áreas · 6 output */
type ScreenIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6;

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

type AvatarCfg = {
  blur: number;
  core: string;
  accent: string;
  gold: string;
  opacity: number;
  particleCount: number;
  pulseDur: string;
  outerR: number;
};

const AVATAR_TIER: Record<Capa1AvatarTier, AvatarCfg> = {
  low: {
    blur: 16,
    core: "#EF4444",
    accent: "#22D3EE",
    gold: "#C9A84C",
    opacity: 0.5,
    particleCount: 4,
    pulseDur: "4.2s",
    outerR: 72,
  },
  mid: {
    blur: 11,
    core: "#F59E0B",
    accent: "#22D3EE",
    gold: "#C9A84C",
    opacity: 0.75,
    particleCount: 9,
    pulseDur: "3.2s",
    outerR: 64,
  },
  high: {
    blur: 6,
    core: "#22D3EE",
    accent: "#06B6D4",
    gold: "#C9A84C",
    opacity: 1,
    particleCount: 16,
    pulseDur: "2.6s",
    outerR: 56,
  },
};

function Capa1AvatarFigure({ tier }: { tier: Capa1AvatarTier }) {
  const uid = useId().replace(/:/g, "");
  const cfg = AVATAR_TIER[tier];
  const particles = useMemo(() => {
    const n = cfg.particleCount;
    const out: { cx: number; cy: number; r: number; delay: string }[] = [];
    for (let i = 0; i < n; i++) {
      const t = (i / n) * Math.PI * 2 + i * 0.7;
      const dist = 78 + (i % 3) * 12;
      out.push({
        cx: 100 + Math.cos(t) * dist,
        cy: 118 + Math.sin(t) * (dist * 0.85),
        r: tier === "high" ? 2 + (i.toString().length % 3) : 1.5 + (i % 2),
        delay: `${(i * 0.23) % 2}s`,
      });
    }
    return out;
  }, [cfg.particleCount, tier]);

  const pFill =
    tier === "high" ? cfg.gold : tier === "mid" ? cfg.accent : cfg.accent;
  const pFillAlt = tier === "low" ? cfg.core : cfg.gold;

  return (
    <svg
      viewBox="0 0 200 280"
      className="mx-auto h-72 w-56 shrink-0 md:h-80 md:w-64"
      aria-hidden
    >
      <defs>
        <radialGradient id={`capa1-head-${uid}`} cx="50%" cy="32%" r="42%">
          <stop
            offset="0%"
            stopColor={cfg.core}
            stopOpacity={0.95 * cfg.opacity}
          />
          <stop
            offset="55%"
            stopColor={cfg.accent}
            stopOpacity={0.4 * cfg.opacity}
          />
          <stop offset="100%" stopColor={cfg.core} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`capa1-torso-${uid}`} cx="50%" cy="54%" r="48%">
          <stop
            offset="0%"
            stopColor={cfg.accent}
            stopOpacity={0.55 * cfg.opacity}
          />
          <stop
            offset="40%"
            stopColor={cfg.core}
            stopOpacity={0.35 * cfg.opacity}
          />
          <stop offset="100%" stopColor={cfg.core} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`capa1-orb-${uid}`} cx="50%" cy="48%" r="35%">
          <stop
            offset="0%"
            stopColor="#FFFFFF"
            stopOpacity={0.25 * cfg.opacity}
          />
          <stop
            offset="45%"
            stopColor={cfg.core}
            stopOpacity={0.85 * cfg.opacity}
          />
          <stop
            offset="100%"
            stopColor={tier === "high" ? cfg.gold : cfg.core}
            stopOpacity="0"
          />
        </radialGradient>
        <filter
          id={`capa1-glow-${uid}`}
          x="-80%"
          y="-80%"
          width="260%"
          height="260%"
        >
          <feGaussianBlur
            in="SourceGraphic"
            stdDeviation={cfg.blur}
            result="blurOut"
          />
          <feMerge>
            <feMergeNode in="blurOut" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g filter={`url(#capa1-glow-${uid})`}>
        <ellipse
          cx="100"
          cy="128"
          rx="56"
          ry={cfg.outerR}
          fill={`url(#capa1-torso-${uid})`}
        >
          <animate
            attributeName="opacity"
            values={`${0.75 * cfg.opacity};${cfg.opacity};${0.75 * cfg.opacity}`}
            dur={cfg.pulseDur}
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="100"
          cy="78"
          rx="38"
          ry="44"
          fill={`url(#capa1-head-${uid})`}
        >
          <animate
            attributeName="opacity"
            values={`${0.65 * cfg.opacity};${cfg.opacity};${0.65 * cfg.opacity}`}
            dur={cfg.pulseDur}
            begin="0.4s"
            repeatCount="indefinite"
          />
        </ellipse>
        <circle cx="100" cy="102" r="28" fill={`url(#capa1-orb-${uid})`}>
          <animate
            attributeName="r"
            values={
              tier === "low"
                ? "24;30;24"
                : tier === "mid"
                  ? "26;34;26"
                  : "28;36;28"
            }
            dur={cfg.pulseDur}
            repeatCount="indefinite"
          />
        </circle>
      </g>

      <g style={{ opacity: cfg.opacity }}>
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={p.cx}
            cy={p.cy}
            r={p.r}
            fill={i % 3 === 0 ? pFill : pFillAlt}
            opacity={tier === "low" ? 0.35 : tier === "mid" ? 0.55 : 0.85}
          >
            <animate
              attributeName="opacity"
              values={
                tier === "high"
                  ? "0.2;1;0.35;0.2"
                  : tier === "mid"
                    ? "0.25;0.8;0.25"
                    : "0.15;0.45;0.15"
              }
              dur={tier === "high" ? "2s" : "3.2s"}
              begin={`${p.delay}`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="cy"
              values={`${p.cy};${p.cy - 6};${p.cy}`}
              dur="3.5s"
              begin={`${p.delay}`}
              repeatCount="indefinite"
            />
          </circle>
        ))}
      </g>
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

  const omittedCount = useMemo(
    () => saved.filter((s) => s === null).length,
    [saved],
  );

  const answeredCount = CAPA1_AREAS.length - omittedCount;

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

  const finishAreas = () => {
    setScreen(6);
  };

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
      finishAreas();
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
      finishAreas();
    }
  };

  const globalNivel = useMemo(
    () => capa1GlobalNivelFromSaved(saved),
    [saved],
  );
  const highlight = useMemo(() => capa1HighlightAnswer(saved), [saved]);

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
            <span className="tabular-nums">
              {Math.round((k / CAPA1_AREAS.length) * 100)}%
            </span>
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
            <span className="max-w-[45%] text-left">
              {currentDef.poloIzquierda}
            </span>
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

  const renderOutput = () => {
    let nombreBase = nombreStore.trim();
    if (!nombreBase) {
      nombreBase = nombreFromPersistedOnboardingSession();
    }
    if (!nombreBase) {
      nombreBase = "Jugador";
    }
    const nombreCapitalizado =
      nombreBase.charAt(0).toUpperCase() + nombreBase.slice(1);
    const chroniclesName = `${nombreCapitalizado}Chronicles`;

    if (!globalNivel || !highlight) {
      return (
        <div className="flex flex-col gap-8" style={transitionStyle}>
          <p className="text-center text-text-muted">
            No registraste ninguna área. Recarga la página para empezar de
            nuevo el mapa.
          </p>
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan"
          >
            Continuar →
          </button>
        </div>
      );
    }

    const { nivelLabel, tier } = globalNivel;

    return (
      <div className="flex flex-col gap-10" style={transitionStyle}>
        <div className="overflow-visible">
          <Capa1AvatarFigure tier={tier} />
        </div>
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
            <p className="text-lg font-semibold text-text-primary">
              {nivelLabel}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Área destacada
            </p>
            <p className="text-lg font-semibold text-text-primary">
              {highlight.label}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-text-muted">
              Atributo
            </p>
            <p className="text-lg font-semibold text-accent-gold">
              {highlight.atributo}
            </p>
          </div>
        </div>

        <p className="text-base leading-relaxed text-text-primary md:text-lg">
          {highlight.respuestaCompleta}
        </p>

        {omittedCount > 0 ? (
          <>
            <p className="text-center text-sm text-text-muted">
              {omittedCount} área{omittedCount === 1 ? "" : "s"} omitida
              {omittedCount === 1 ? "" : "s"} — tu perfil está al{" "}
              {Math.round((answeredCount / CAPA1_AREAS.length) * 100)}%.
            </p>
            <p className="rounded-lg border border-accent-gold/30 bg-accent-gold/5 px-4 py-3 text-sm text-text-primary">
              Tu perfil está incompleto. Puedes completarlo en la próxima sesión.
            </p>
          </>
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
          {screen === 6 && renderOutput()}
        </div>
      </div>
    </main>
  );
}
