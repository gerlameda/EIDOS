import type { Modulo02Area } from "@/lib/modulo02/areas";

export type VisionOption = {
  id: string;
  text: string;
};

const VISION_OPTION_MAP: Record<Modulo02Area, readonly string[]> = {
  salud: [
    "Tengo energía para lo que importa — duermo, me muevo, como bien.",
    "Mi cuerpo me acompaña — no lo pienso, simplemente funciona.",
    "Completé algo físico que antes me parecía imposible.",
  ],
  mente: [
    "Pienso con claridad — sin ruido, sin dispersión constante.",
    "Tengo una práctica que me regresa a mí cuando me pierdo.",
    "Aprendí algo que cambió cómo veo el mundo.",
  ],
  relaciones: [
    "Las personas más importantes en mi vida lo saben y lo sienten.",
    "Tengo vínculos que me dan energía, no que me la quitan.",
    "Soy el tipo de persona que quiero que recuerden.",
  ],
  proposito: [
    "Trabajo en algo que importa — aunque sea difícil, no es vacío.",
    "Hay un proyecto mío en el mundo que no existía antes.",
    "Sé por qué me levanto. No todos los días, pero la mayoría.",
  ],
  recursos: [
    "El dinero no dicta mis decisiones — yo las dicto.",
    "Tengo un sistema — ingreso, ahorro, inversión — aunque sea pequeño.",
    "Construí algo que genera valor más allá de mi tiempo.",
  ],
};

export function getVisionOptions(area: string, _score: number): VisionOption[] {
  const key = area as Modulo02Area;
  const opts = VISION_OPTION_MAP[key] ?? VISION_OPTION_MAP.salud;
  return opts.map((text, i) => ({ id: `${key}-${i + 1}`, text }));
}

