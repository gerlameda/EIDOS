"use client";

import { useId, useMemo } from "react";
import { useEffectsStore } from "@/store/effectsStore";
import type { Capa1AvatarTier } from "@/lib/modulo01/capa1-flow-data";

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

export type EidosAvatarProps = {
  tier: Capa1AvatarTier;
  className?: string;
  /** Anima fade-in desde la oscuridad en el primer mount. */
  emerge?: boolean;
  /** Si true, reacciona a orbBurstTick del effectsStore con un burst de brillo. */
  reactive?: boolean;
};

/** Orbe energético SVG (Módulo 01 Capa 1 / dashboard). */
export function EidosAvatar({
  tier,
  className,
  emerge = false,
  reactive = false,
}: EidosAvatarProps) {
  const uid = useId().replace(/:/g, "");
  const cfg = AVATAR_TIER[tier];
  const orbBurstTick = useEffectsStore((s) => s.orbBurstTick);

  // Burst activo cuando: reactive y hay un tick válido.
  // El key-based remount abajo se encarga de replay en cada cambio.
  const bursting = reactive && orbBurstTick > 0;

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

  const baseClass =
    className ?? "mx-auto h-72 w-56 shrink-0 md:h-80 md:w-64";
  const animClass = [
    emerge ? "animate-avatar-emerge" : "",
    bursting ? "animate-orb-burst" : "",
  ]
    .filter(Boolean)
    .join(" ");
  const combinedClass = animClass
    ? `${baseClass} ${animClass}`
    : baseClass;

  return (
    <svg
      key={bursting ? `burst-${orbBurstTick}` : "static"}
      viewBox="0 0 200 280"
      className={combinedClass}
      aria-hidden
    >
      <defs>
        <radialGradient id={`eidos-head-${uid}`} cx="50%" cy="32%" r="42%">
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
        <radialGradient id={`eidos-torso-${uid}`} cx="50%" cy="54%" r="48%">
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
        <radialGradient id={`eidos-orb-${uid}`} cx="50%" cy="48%" r="35%">
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
          id={`eidos-glow-${uid}`}
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

      <g filter={`url(#eidos-glow-${uid})`}>
        <ellipse
          cx="100"
          cy="128"
          rx="56"
          ry={cfg.outerR}
          fill={`url(#eidos-torso-${uid})`}
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
          fill={`url(#eidos-head-${uid})`}
        >
          <animate
            attributeName="opacity"
            values={`${0.65 * cfg.opacity};${cfg.opacity};${0.65 * cfg.opacity}`}
            dur={cfg.pulseDur}
            begin="0.4s"
            repeatCount="indefinite"
          />
        </ellipse>
        <circle cx="100" cy="102" r="28" fill={`url(#eidos-orb-${uid})`}>
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
