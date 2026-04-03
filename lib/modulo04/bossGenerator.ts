import type { Boss } from "@/types/boss";

const BOSS_DATA: Record<
  string,
  {
    names: string[];
    taunts: { intimidando: string; herido: string; desesperado: string };
  }
> = {
  salud: {
    names: [
      "El Sedentario Imparable",
      "La Inercia Física",
      "El Cuerpo en Pausa",
    ],
    taunts: {
      intimidando: "¿Eso es todo lo que tienes?",
      herido: "No... esto no puede estar pasando.",
      desesperado: "Imposible. Me estás destruyendo.",
    },
  },
  mente: {
    names: [
      "El Ruido Mental",
      "La Distracción Crónica",
      "El Caos Interior",
    ],
    taunts: {
      intimidando: "Tu mente siempre fue mía.",
      herido: "Estás... más enfocado de lo que esperaba.",
      desesperado: "No. No puedes silenciarme así.",
    },
  },
  relaciones: {
    names: [
      "El Aislamiento Crónico",
      "La Distancia Invisible",
      "El Muro Interior",
    ],
    taunts: {
      intimidando: "Nadie te necesita de verdad.",
      herido: "Estás conectando... no me gusta esto.",
      desesperado: "Espera. No te vayas todavía.",
    },
  },
  proposito: {
    names: [
      "La Deriva sin Rumbo",
      "El Vacío de Dirección",
      "La Parálisis del Propósito",
    ],
    taunts: {
      intimidando: "¿Para qué todo esto, realmente?",
      herido: "Empiezas a tener claridad. Eso me preocupa.",
      desesperado: "No. Tenías que seguir perdido.",
    },
  },
  recursos: {
    names: [
      "La Escasez Persistente",
      "El Techo Financiero",
      "La Deuda Invisible",
    ],
    taunts: {
      intimidando: "Nunca será suficiente.",
      herido: "Estás construyendo algo real. Eso es peligroso.",
      desesperado: "Imposible. Nadie escapa de mí tan rápido.",
    },
  },
};

const FALLBACK = {
  names: ["El Obstáculo Mayor", "La Resistencia Interna"],
  taunts: {
    intimidando: "¿Eso es todo lo que tienes?",
    herido: "No me rindas ahora...",
    desesperado: "Imposible. Esto no puede estar pasando.",
  },
};

export function generateBossProposal(params: {
  areaFocus: string;
  areaScore: number; // 0-100, score del área prioritaria
  coreAttack: string; // hábito #1 de criticalHabits
  horizon: string; // deadline desde visionAreas (ej. "3 meses", "6 meses", "1 año")
}): Omit<Boss, "id" | "userId" | "createdAt" | "updatedAt"> {
  const data = BOSS_DATA[params.areaFocus] ?? FALLBACK;
  const name = data.names[Math.floor(Math.random() * data.names.length)];

  // HP inversamente proporcional al score: score bajo = boss fuerte
  const maxHp = Math.round(120 - (params.areaScore / 100) * 60); // rango 60-120

  // Deadline desde horizon (string libre desde visión)
  const deadlineDate = new Date();
  const horizonLower = params.horizon.toLowerCase();
  if (horizonLower.includes("3")) {
    deadlineDate.setMonth(deadlineDate.getMonth() + 3);
  } else if (horizonLower.includes("6")) {
    deadlineDate.setMonth(deadlineDate.getMonth() + 6);
  } else {
    deadlineDate.setFullYear(deadlineDate.getFullYear() + 1);
  }
  const deadline = new Intl.DateTimeFormat("en-CA").format(deadlineDate);

  return {
    name,
    maxHp,
    currentHp: maxHp,
    phase: "intimidando",
    deadline,
    areaFocus: params.areaFocus,
    coreAttack: params.coreAttack,
    tauntPhrases: data.taunts,
    defeated: false,
  };
}

