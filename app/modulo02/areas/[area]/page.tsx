"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { AnchorDisplay } from "@/components/modulo02/AnchorDisplay";
import { AreaProgress } from "@/components/modulo02/AreaProgress";
import { HorizonSelector } from "@/components/modulo02/HorizonSelector";
import { VisionSelector } from "@/components/modulo02/VisionSelector";
import { getUnifiedAreaScores } from "@/lib/modulo01/area-scores";
import { getAnchorText } from "@/lib/modulo02/anchor-text";
import {
  AREA_LABELS,
  AREA_ORDER,
  areaNumber,
  MODULO01_AREA_ID_BY_MODULO02,
  type Modulo02Area,
} from "@/lib/modulo02/areas";
import { getHorizonOptions } from "@/lib/modulo02/horizon-options";
import { getVisionOptions } from "@/lib/modulo02/vision-options";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { VisionHorizon } from "@/types/modulo02";

function isArea(value: string): value is Modulo02Area {
  return (AREA_ORDER as readonly string[]).includes(value);
}

export default function Modulo02AreaPage() {
  const router = useRouter();
  const params = useParams<{ area: string }>();

  const areaParam = params?.area ?? "";
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const capa2Areas = useOnboardingStore((s) => s.capa2Areas);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const saveVisionArea = useOnboardingStore((s) => s.saveVisionArea);

  const [selectedStatement, setSelectedStatement] = useState("");
  const [isCustom, setIsCustom] = useState(false);
  const [horizon, setHorizon] = useState<VisionHorizon | null>(null);

  const hasModulo01Data = capa1Saved.some((x) => x !== null);

  const validArea = isArea(areaParam) ? areaParam : null;
  const completedAreas = visionAreas.map((v) => v.area).filter((a): a is Modulo02Area => isArea(a));
  const firstIncomplete = AREA_ORDER.find((a) => !completedAreas.includes(a)) ?? null;

  useEffect(() => {
    if (!hasModulo01Data) {
      router.replace("/modulo01");
      return;
    }
    if (!validArea) {
      router.replace("/modulo02/areas/salud");
      return;
    }
    if (firstIncomplete) {
      const currentIdx = AREA_ORDER.indexOf(validArea);
      const firstIdx = AREA_ORDER.indexOf(firstIncomplete);
      if (currentIdx > firstIdx) {
        router.replace(`/modulo02/areas/${firstIncomplete}`);
      }
    }
  }, [firstIncomplete, hasModulo01Data, router, validArea]);

  const scores = useMemo(
    () => getUnifiedAreaScores(capa1Saved, capa2Areas),
    [capa1Saved, capa2Areas],
  );

  const sourceScore = useMemo(() => {
    if (!validArea) return 0;
    const modulo01Id = MODULO01_AREA_ID_BY_MODULO02[validArea];
    const row = scores.find((s) => s.areaId === modulo01Id);
    return row?.score ?? 0;
  }, [scores, validArea]);

  const savedVision = useMemo(
    () => (validArea ? visionAreas.find((v) => v.area === validArea) ?? null : null),
    [validArea, visionAreas],
  );

  useEffect(() => {
    if (!savedVision) {
      setSelectedStatement("");
      setIsCustom(false);
      setHorizon(null);
      return;
    }
    setSelectedStatement(savedVision.statement);
    setIsCustom(savedVision.isCustom);
    setHorizon(savedVision.horizon);
  }, [savedVision]);

  if (!validArea || !hasModulo01Data) return null;

  const anchor = getAnchorText(validArea, sourceScore);
  const areaOptions = getVisionOptions(validArea, sourceScore);
  const horizonOptions = getHorizonOptions(sourceScore);
  const current = areaNumber(validArea);
  const selectedReady = selectedStatement.trim().length > 0;
  const canSave = selectedReady && horizon !== null;

  const onSaveAndNext = () => {
    if (!canSave || !horizon) return;
    saveVisionArea({
      area: validArea,
      statement: selectedStatement.trim(),
      isCustom,
      horizon,
      sourceScore,
    });
    const idx = AREA_ORDER.indexOf(validArea);
    const nextArea = AREA_ORDER[idx + 1];
    router.push(nextArea ? `/modulo02/areas/${nextArea}` : "/modulo02/cierre");
  };

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-8 text-text-primary md:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <header className="flex items-center justify-between gap-4">
          <p className="text-sm text-text-muted">
            Área {current} de 5 • {AREA_LABELS[validArea]}
          </p>
          <AreaProgress currentArea={validArea} completedAreas={completedAreas} />
        </header>

        <div className="border-t border-white/10" />

        <section className="space-y-8">
          <div className="space-y-2">
            <p className="text-xs tracking-[0.2em] text-accent-gold">
              {String(current).padStart(2, "0")} / 05
            </p>
            <h1 className="text-3xl font-semibold uppercase tracking-wide text-accent-cyan md:text-4xl">
              {AREA_LABELS[validArea]}
            </h1>
          </div>
          <AnchorDisplay
            area={AREA_LABELS[validArea]}
            score={sourceScore}
            headline={anchor.headline}
            subtext={anchor.subtext}
          />
        </section>

        <div className="border-t border-white/10" />

        <VisionSelector
          options={areaOptions}
          selectedStatement={selectedStatement}
          isCustom={isCustom}
          onChange={(statement, custom) => {
            setSelectedStatement(statement);
            setIsCustom(custom);
          }}
        />

        <div className="border-t border-white/10" />

        <HorizonSelector
          options={horizonOptions}
          selected={horizon}
          onChange={setHorizon}
          visible={selectedReady}
        />

        {canSave ? (
          <button
            type="button"
            onClick={onSaveAndNext}
            className="w-full rounded-lg border border-accent-gold bg-accent-gold/10 py-3.5 font-medium text-accent-gold transition-colors duration-200 hover:bg-accent-gold/20"
          >
            Guardar y continuar →
          </button>
        ) : null}
      </div>
    </main>
  );
}

