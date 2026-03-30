"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { EidosAvatar } from "@/components/avatar/EidosAvatar";
import {
  normalizeNombreUsuario,
  useOnboardingStore,
} from "@/store/onboardingStore";
import {
  CAPA1_AREAS,
  CAPA1_RANGO_COLORS,
  type Capa1AreaAnswer,
  type Capa1Rango,
  capa1AnswerWithMaxScore,
  capa1GlobalNivelFromSaved,
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

function Capa1TouchSlider({
  value,
  onChange,
  fillColor,
}: {
  value: number;
  onChange: (v: number) => void;
  fillColor: string;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  const commitClientX = useCallback((clientX: number) => {
    const el = trackRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.width <= 0) return;
    const x = Math.min(rect.right, Math.max(rect.left, clientX));
    const pct = ((x - rect.left) / rect.width) * 100;
    onChangeRef.current(Math.round(Math.min(100, Math.max(0, pct))));
  }, []);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      commitClientX(e.clientX);
    };
    const onMouseUp = () => {
      dragging.current = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (!dragging.current) return;
      e.preventDefault();
      const t = e.touches[0];
      if (t) commitClientX(t.clientX);
    };
    const onTouchEnd = () => {
      dragging.current = false;
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd);
    window.addEventListener("touchcancel", onTouchEnd);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [commitClientX]);

  const beginDrag = (clientX: number) => {
    dragging.current = true;
    commitClientX(clientX);
  };

  return (
    <div
      ref={trackRef}
      role="slider"
      tabIndex={0}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={value}
      aria-label="Valor de 0 a 100"
      className="relative h-3 w-full cursor-pointer touch-none select-none rounded-full bg-text-muted/25"
      onMouseDown={(e) => {
        e.preventDefault();
        beginDrag(e.clientX);
      }}
      onTouchStart={(e) => {
        const t = e.touches[0];
        if (t) beginDrag(t.clientX);
      }}
    >
      <div
        className="pointer-events-none absolute inset-y-0 left-0 rounded-full"
        style={{ width: `${value}%`, backgroundColor: fillColor }}
      />
      <div
        className="pointer-events-none absolute top-1/2 h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-bg-base shadow-md"
        style={{ left: `${value}%`, backgroundColor: fillColor }}
      />
    </div>
  );
}

export default function Modulo01Capa1Page() {
  const router = useRouter();
  const nombreStore = useOnboardingStore((s) => s.nombre);
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const setCapa1Saved = useOnboardingStore((s) => s.setCapa1Saved);

  const [screen, setScreen] = useState<ScreenIndex>(0);
  const [areaIndex, setAreaIndex] = useState(0);
  const [slider, setSlider] = useState(50);

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
    () => capa1Saved.filter((a) => a === null).length,
    [capa1Saved],
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
    if (!ans) return;
    setCapa1Saved(
      useOnboardingStore.getState().capa1Saved.map((x, j) =>
        j === areaIndex ? ans : x,
      ),
    );
    if (areaIndex < CAPA1_AREAS.length - 1) {
      goToArea(areaIndex + 1);
    } else {
      finishAreas();
    }
  };

  const omitirArea = () => {
    setCapa1Saved(
      useOnboardingStore.getState().capa1Saved.map((x, j) =>
        j === areaIndex ? null : x,
      ),
    );
    if (areaIndex < CAPA1_AREAS.length - 1) {
      goToArea(areaIndex + 1);
    } else {
      finishAreas();
    }
  };

  const globalNivel = useMemo(
    () => capa1GlobalNivelFromSaved(capa1Saved),
    [capa1Saved],
  );
  const answerMaxScore = useMemo(
    () => capa1AnswerWithMaxScore(capa1Saved),
    [capa1Saved],
  );

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
          <p className="mt-4 text-sm leading-relaxed text-text-muted md:text-base">
            Solo tú ves esto. Entre más honesto seas hoy, más preciso será tu
            mapa — y más útil será lo que EIDOS te muestre.
          </p>
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
            <Capa1TouchSlider
              value={slider}
              onChange={setSlider}
              fillColor={rangeColor}
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
    const chroniclesName = `${normalizeNombreUsuario(nombreBase)}Chronicles`;

    if (!globalNivel || !answerMaxScore) {
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

    const { nivelLabel, atributoGlobal, tier } = globalNivel;

    return (
      <div className="flex flex-col gap-10" style={transitionStyle}>
        <div className="overflow-visible">
          <EidosAvatar tier={tier} />
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
              Atributo
            </p>
            <p className="text-lg font-semibold text-accent-gold">
              {atributoGlobal}
            </p>
          </div>
        </div>

        <p className="text-base leading-relaxed text-text-primary md:text-lg">
          {answerMaxScore.respuestaCompleta}
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
