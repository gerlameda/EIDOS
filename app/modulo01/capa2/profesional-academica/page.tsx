"use client";

import { useId, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { MultipleChoiceQuestion } from "@/components/modulo01/capa2/MultipleChoiceQuestion";
import { Scale1to5Question } from "@/components/modulo01/capa2/Scale1to5Question";
import { SliderQuestion } from "@/components/modulo01/capa2/SliderQuestion";
import { capa1RangoFromScore } from "@/lib/modulo01/capa1-flow-data";
import type { Capa2AreaStatus } from "@/lib/modulo01/capa2-types";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

type Paso = -1 | 0 | 1 | 2 | 3 | 4 | 5;

const AREA_ID = "profesional-academica";

const WORK_P1_LABELS: [string, string, string, string, string] = [
  "Me aleja completamente",
  "No tiene mucha relación",
  "A veces sí, a veces no",
  "En general me acerca",
  "Completamente alineado",
];

const WORK_P3_OPTIONS = [
  "Solo intercambio tiempo por dinero",
  "Hay algo de propósito pero no es claro",
  "Estoy construyendo aunque no sea perfecto",
  "Estoy construyendo algo que realmente importa",
] as const;

const STUDY_P1_LABELS: [string, string, string, string, string] = [
  "No tiene nada que ver",
  "Poco o nada",
  "Algo, pero no estoy seguro",
  "Bastante bien",
  "Totalmente alineado",
];

const STUDY_P3_OPTIONS = [
  "Esperando a graduarte para empezar",
  "Lo he pensado pero no he empezado",
  "Estoy dando los primeros pasos",
  "Ya estoy construyendo algo en paralelo",
] as const;

const ATRIBUTO_POR_RANGO: Record<"bajo" | "medio" | "alto", string> = {
  bajo: "Exploración",
  medio: "Alineación",
  alto: "Propósito",
};

function mensajeResultado(score: number): string {
  const s = Math.min(100, Math.max(0, Math.round(score)));
  const rango = capa1RangoFromScore(s);
  if (rango === "bajo") {
    return `${s}% en tu trayectoria. Hay desconexión entre lo que haces y quien quieres ser. Eso no es fracaso — es información.`;
  }
  if (rango === "medio") {
    return `${s}%. Hay algo ahí, pero no está completamente definido. Estás cerca del eje — lo que falta es claridad, no esfuerzo.`;
  }
  return `${s}% en tu profesión. Estás en el lugar correcto. El trabajo ahora es profundizar, no buscar otra cosa.`;
}

function calibracionLabel(v: number): { text: string; color: string } {
  if (v <= 33) {
    return { text: "Área que necesita atención", color: "#EF4444" };
  }
  if (v <= 66) {
    return { text: "En construcción", color: "#F59E0B" };
  }
  return { text: "Área sólida", color: "#22D3EE" };
}

function CalibracionSlider({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  const uid = useId().replace(/:/g, "");
  const v = Math.min(100, Math.max(0, value));
  const webkitTrackBg = `linear-gradient(to right, #22D3EE 0%, #22D3EE ${v}%, rgba(240,237,232,0.15) ${v}%, rgba(240,237,232,0.15) 100%)`;
  const band = calibracionLabel(v);

  return (
    <div className="mx-auto w-full max-w-[480px] px-6">
      <style>{`
        #calib-range-${uid}::-webkit-slider-runnable-track {
          height: 8px;
          border-radius: 9999px;
          background: ${webkitTrackBg};
        }
        #calib-range-${uid}::-moz-range-track {
          height: 8px;
          border-radius: 9999px;
          background: rgba(240, 237, 232, 0.15);
        }
        #calib-range-${uid}::-moz-range-progress {
          height: 8px;
          border-radius: 9999px;
          background: #22d3ee;
        }
      `}</style>
      <p className="mt-6 text-center text-lg font-medium tabular-nums text-[#F0EDE8]">
        {v}%
      </p>
      <div className="mt-4">
        <input
          id={`calib-range-${uid}`}
          type="range"
          min={0}
          max={100}
          value={v}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={v}
          onChange={(e) => onChange(Number(e.target.value))}
          className="h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent accent-[#22D3EE] [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:cursor-pointer [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-[#0D0D14] [&::-moz-range-thumb]:bg-[#22D3EE] [&::-moz-range-thumb]:shadow-sm [&::-webkit-slider-thumb]:mt-[-5px] [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-[#0D0D14] [&::-webkit-slider-thumb]:bg-[#22D3EE] [&::-webkit-slider-thumb]:shadow-sm"
        />
      </div>
      <p
        className="mt-4 text-center text-sm font-medium transition-colors duration-200"
        style={{ color: band.color }}
      >
        {band.text}
      </p>
      <div className="mt-3 flex justify-between gap-4 text-xs leading-snug text-[rgba(240,237,232,0.5)] sm:text-sm">
        <span className="max-w-[42%] text-left">Necesita atención</span>
        <span className="max-w-[42%] text-right">Área sólida</span>
      </div>
    </div>
  );
}

export default function Capa2ProfesionalAcademicaPage() {
  const router = useRouter();
  const updateCapa2Area = useOnboardingStore((s) => s.updateCapa2Area);

  const [paso, setPaso] = useState<Paso>(-1);
  const [contexto, setContexto] = useState<
    "trabajo" | "estudio" | "ambos" | null
  >(null);
  const [p1, setP1] = useState<number | null>(null);
  const [p2, setP2] = useState(50);
  const [p3, setP3] = useState<number | null>(null);
  const [calibracion, setCalibracion] = useState(50);

  const rama = useMemo(
    () => (contexto === "estudio" ? "estudio" : "trabajo"),
    [contexto],
  );

  const canAdvance =
    paso === 0 ||
    paso === 2 ||
    paso === 4 ||
    (paso === 1 && p1 !== null) ||
    (paso === 3 && p3 !== null);

  const selectContexto = (c: "trabajo" | "estudio" | "ambos") => {
    setContexto(c);
    setPaso(0);
  };

  const handleNext = () => {
    if (!canAdvance) return;

    if (paso === 4) {
      const now = new Date().toISOString();
      const areaStatus: Capa2AreaStatus = {
        areaId: AREA_ID,
        questions: [
          {
            areaId: AREA_ID,
            questionId: "p1",
            format: "scale_1_5",
            value: p1!,
            answeredAt: now,
          },
          {
            areaId: AREA_ID,
            questionId: "p2",
            format: "slider_0_100",
            value: p2,
            answeredAt: now,
          },
          {
            areaId: AREA_ID,
            questionId: "p3",
            format: "multiple_choice",
            value: p3!,
            answeredAt: now,
          },
        ],
        percentageScore: calibracion,
        completedAt: now,
      };
      updateCapa2Area(areaStatus);
      void syncProfileToSupabase(useOnboardingStore.getState());
      setPaso(5);
      return;
    }

    setPaso((p) => (p + 1) as Paso);
  };

  const rangoResultado = capa1RangoFromScore(calibracion);
  const atributo = ATRIBUTO_POR_RANGO[rangoResultado];

  const progressSegments =
    paso >= 1 && paso <= 3 ? (
      <div className="mb-8 w-full max-w-[480px] px-6">
        <p className="mb-3 text-center text-xs text-[rgba(240,237,232,0.5)]">
          Pregunta {paso} de 3
        </p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className={
                "h-1.5 flex-1 rounded-full transition-colors duration-200 " +
                (i < paso ? "bg-[#22D3EE]" : "bg-[rgba(240,237,232,0.1)]")
              }
            />
          ))}
        </div>
      </div>
    ) : null;

  const ctaLabel =
    paso === 0
      ? "Entendido, vamos."
      : paso === 4
        ? "Ver mi resultado"
        : "Siguiente";

  return (
    <main className="flex min-h-screen flex-col bg-[#0D0D14] text-[#F0EDE8]">
      <div className="flex flex-1 flex-col">
        {progressSegments}

        {paso === -1 ? (
          <div className="flex flex-1 flex-col justify-center px-6 pb-6">
            <div className="mx-auto w-full max-w-[480px] text-center">
              <h2 className="text-xl font-semibold leading-snug text-[#F0EDE8] md:text-2xl">
                ¿Cuál es tu situación actual?
              </h2>
              <div className="mt-8 flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => selectContexto("trabajo")}
                  className="w-full rounded-xl border border-[rgba(240,237,232,0.1)] bg-transparent px-4 py-4 text-center text-base text-[#F0EDE8] transition-colors duration-200 hover:bg-[rgba(240,237,232,0.04)]"
                >
                  Trabajo
                </button>
                <button
                  type="button"
                  onClick={() => selectContexto("estudio")}
                  className="w-full rounded-xl border border-[rgba(240,237,232,0.1)] bg-transparent px-4 py-4 text-center text-base text-[#F0EDE8] transition-colors duration-200 hover:bg-[rgba(240,237,232,0.04)]"
                >
                  Estudio
                </button>
                <button
                  type="button"
                  onClick={() => selectContexto("ambos")}
                  className="w-full rounded-xl border border-[rgba(240,237,232,0.1)] bg-transparent px-4 py-4 text-center text-base text-[#F0EDE8] transition-colors duration-200 hover:bg-[rgba(240,237,232,0.04)]"
                >
                  Ambos
                </button>
              </div>
            </div>
          </div>
        ) : null}

        {paso === 0 ? (
          <div className="flex flex-1 flex-col justify-center px-6 pb-6">
            <div className="mx-auto w-full max-w-[480px] text-center">
              <h1 className="text-2xl font-semibold tracking-tight text-[#F0EDE8] md:text-3xl">
                Solo tú ves esto.
              </h1>
              <p className="mt-6 text-base leading-relaxed text-[rgba(240,237,232,0.85)] md:text-lg">
                Entre más honesto seas, más preciso será tu mapa — y más útil será
                lo que EIDOS construya para ti.
              </p>
            </div>
          </div>
        ) : null}

        {paso === 1 ? (
          <div className="flex-1 pb-6">
            <Scale1to5Question
              question={
                rama === "estudio"
                  ? "¿Lo que estudias conecta con quien quieres ser?"
                  : "¿Tu trabajo te acerca a quien quieres ser?"
              }
              labels={
                rama === "estudio" ? STUDY_P1_LABELS : WORK_P1_LABELS
              }
              selected={p1}
              onSelect={setP1}
            />
          </div>
        ) : null}

        {paso === 2 ? (
          <div className="flex-1 pb-6">
            <SliderQuestion
              question={
                rama === "estudio"
                  ? "¿Estás aprovechando esta etapa o solo sobreviviendo materias?"
                  : "¿Sientes que estás creciendo o estancado?"
              }
              leftLabel={
                rama === "estudio"
                  ? "Solo sobrevivo"
                  : "Completamente estancado"
              }
              rightLabel={
                rama === "estudio"
                  ? "La estoy aprovechando al máximo"
                  : "Creciendo constantemente"
              }
              value={p2}
              onChange={setP2}
            />
          </div>
        ) : null}

        {paso === 3 ? (
          <div className="flex-1 pb-6">
            <MultipleChoiceQuestion
              question={
                rama === "estudio"
                  ? "¿Estás construyendo algo en paralelo o esperando a graduarte para empezar?"
                  : "¿Estás construyendo algo que importe o intercambiando tu tiempo por seguridad?"
              }
              options={
                rama === "estudio"
                  ? [...STUDY_P3_OPTIONS]
                  : [...WORK_P3_OPTIONS]
              }
              selected={p3}
              onSelect={setP3}
            />
          </div>
        ) : null}

        {paso === 4 ? (
          <div className="flex-1 pb-6">
            <div className="mx-auto w-full max-w-[480px] px-6">
              <h2 className="text-xl font-normal leading-snug text-[#F0EDE8] md:text-2xl">
                Ahora ponle número.
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-[rgba(240,237,232,0.5)] md:text-base">
                No el que quisieras tener — el que tienes hoy.
              </p>
            </div>
            <CalibracionSlider value={calibracion} onChange={setCalibracion} />
          </div>
        ) : null}

        {paso === 5 ? (
          <div className="flex flex-1 flex-col justify-center px-6 pb-6">
            <div className="mx-auto w-full max-w-[480px]">
              <p className="text-center text-2xl font-semibold text-[#22D3EE] md:text-3xl">
                {atributo}
              </p>
              <p className="mt-8 text-base leading-relaxed text-[#F0EDE8] md:text-lg">
                {mensajeResultado(calibracion)}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      {paso !== -1 ? (
        <div className="sticky bottom-0 border-t border-[rgba(240,237,232,0.08)] bg-[#0D0D14] px-6 py-5">
          <div className="mx-auto w-full max-w-[480px]">
            {paso < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                disabled={!canAdvance}
                className={
                  "w-full rounded-xl py-4 text-center text-base font-semibold transition-opacity duration-200 " +
                  "bg-[#22D3EE] text-[#0D0D14] " +
                  (!canAdvance
                    ? "cursor-not-allowed opacity-40"
                    : "opacity-100")
                }
              >
                {ctaLabel}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => router.push("/modulo01/capa2")}
                className="w-full rounded-xl bg-[#22D3EE] py-4 text-center text-base font-semibold text-[#0D0D14] transition-opacity duration-200"
              >
                Continuar
              </button>
            )}
          </div>
        </div>
      ) : null}
    </main>
  );
}
