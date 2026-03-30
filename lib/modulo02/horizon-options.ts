import type { VisionHorizon } from "@/types/modulo02";

export type HorizonOption = {
  value: VisionHorizon;
  label: string;
  sublabel: string;
};

export function getHorizonOptions(score: number): HorizonOption[] {
  if (score <= 50) {
    return [
      {
        value: "6m",
        label: "6 meses — necesito cambio ya",
        sublabel: "Horizonte corto, máxima urgencia.",
      },
      {
        value: "1y",
        label: "1 año — paso a paso",
        sublabel: "Ritmo sostenible con enfoque.",
      },
      {
        value: "2-3y",
        label: "2–3 años — transformación real",
        sublabel: "Cambio profundo con paciencia.",
      },
    ];
  }

  if (score <= 75) {
    return [
      {
        value: "6m",
        label: "6 meses — quiero acelerar",
        sublabel: "Consolidar rápido lo que ya existe.",
      },
      {
        value: "1y",
        label: "1 año — con intención",
        sublabel: "Construcción consistente con dirección.",
      },
      {
        value: "2-3y",
        label: "2–3 años — construir sólido",
        sublabel: "Base robusta para mantener resultados.",
      },
    ];
  }

  return [
    {
      value: "6m",
      label: "6 meses — voy a optimizar",
      sublabel: "Ajustes finos de alto impacto.",
    },
    {
      value: "1y",
      label: "1 año — siguiente nivel",
      sublabel: "Escalar rendimiento y profundidad.",
    },
    {
      value: "2-3y",
      label: "2–3 años — legado",
      sublabel: "Pensar en impacto que trasciende.",
    },
  ];
}

