"use client";

import Link from "next/link";
import { useEffect } from "react";
import { XPBar } from "@/components/avatar/XPBar";
import { buildDailyMissions } from "@/lib/modulo04/missions";
import { registerAttack, saveBossHp } from "@/lib/supabase/boss";
import { useBossStore } from "@/store/bossStore";
import { useDailyStore } from "@/store/dailyStore";
import { useEffectsStore } from "@/store/effectsStore";
import type { Boss } from "@/types/boss";
import type { DailyMission } from "@/types/modulo04";
import type { RutinaBase, SprintCommitment } from "@/types/modulo03";

interface CampoBaseProps {
  userId: string;
  boss: Boss | null;
  attacksToday: string[];
  rutinaBase: RutinaBase | null;
  sprintCommitments: SprintCommitment[];
}

export default function CampoBase({
  userId,
  boss,
  attacksToday,
  rutinaBase,
  sprintCommitments,
}: CampoBaseProps) {
  const { activeBoss, setActiveBoss, applyDamage } = useBossStore();
  const { missions, setMissions, markMission, checkinClosed } = useDailyStore();
  const triggerAttack = useEffectsStore((s) => s.triggerAttack);
  const floatingDamages = useEffectsStore((s) => s.floatingDamages);
  const dismissDamage = useEffectsStore((s) => s.dismissDamage);
  const attackTick = useEffectsStore((s) => s.attackTick);

  // attackTick !== 0 => ya hubo al menos un ataque en esta sesión.
  // Usamos key-based remount en los elementos animados para disparar
  // los CSS keyframes en cada cambio de tick (React 19 friendly).
  const hasAttacked = attackTick > 0;

  // Inicializar boss y misiones
  useEffect(() => {
    if (boss && !useBossStore.getState().activeBoss) {
      setActiveBoss(boss);
    }
    if (useDailyStore.getState().missions.length === 0) {
      const built = buildDailyMissions(
        rutinaBase,
        sprintCommitments,
        boss?.coreAttack ?? "",
        attacksToday,
      );
      setMissions(built);
    }
  }, [
    boss,
    attacksToday,
    rutinaBase,
    sprintCommitments,
    setActiveBoss,
    setMissions,
  ]);

  const currentBoss = activeBoss ?? boss;
  const hpPercent = currentBoss
    ? Math.round((currentBoss.currentHp / currentBoss.maxHp) * 100)
    : 0;

  const taunt = currentBoss
    ? currentBoss.tauntPhrases[currentBoss.phase]
    : null;

  async function handleAttack(mission: DailyMission) {
    if (mission.markedAt) return;
    const now = new Date().toISOString();
    markMission(mission.key, now);
    applyDamage(mission.damageAmount);
    triggerAttack(mission.damageAmount, mission.isCore);

    if (currentBoss) {
      await registerAttack(
        currentBoss.id,
        userId,
        mission.key,
        mission.damageAmount,
        mission.isCore,
      );
      const newHp = Math.max(0, currentBoss.currentHp - mission.damageAmount);
      const phase =
        newHp <= 0
          ? "desesperado"
          : newHp <= currentBoss.maxHp * 0.4
            ? "herido"
            : "intimidando";
      await saveBossHp(currentBoss.id, newHp, phase, newHp <= 0);
    }
  }

  return (
    <div className="px-5 py-6 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-6">
        {/* XP del jugador — sube con cada ataque */}
        <XPBar />

        {/* Boss card (con screen shake en cada ataque) */}
        {currentBoss ? (
          <section
            key={`boss-shake-${attackTick}`}
            className={`relative space-y-3 overflow-visible rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5 ${hasAttacked ? "animate-screen-shake" : ""}`}
          >
            {/* Damage floats — absolute sobre la card */}
            <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-0">
              {floatingDamages.map((d) => (
                <span
                  key={d.id}
                  onAnimationEnd={() => dismissDamage(d.id)}
                  className={`animate-damage-float absolute left-1/2 top-2 font-mono text-2xl font-bold drop-shadow-[0_0_8px_rgba(34,211,238,0.55)] ${
                    d.isCore ? "text-[#C9A84C]" : "text-[#22D3EE]"
                  }`}
                >
                  −{d.amount}
                  {d.isCore && (
                    <span className="ml-1 text-[10px] tracking-widest">
                      CORE
                    </span>
                  )}
                </span>
              ))}
            </div>

            {taunt && (
              <p className="text-xs italic text-[rgba(240,237,232,0.5)]">
                {`"${taunt}"`}
              </p>
            )}
            <h2 className="text-lg font-bold uppercase tracking-wider text-[#F0EDE8]">
              <span
                key={`flinch-${attackTick}`}
                className={hasAttacked ? "animate-boss-flinch" : ""}
              >
                {currentBoss.name}
              </span>
            </h2>
            {/* HP bar */}
            <div className="space-y-1">
              <div className="relative h-2 w-full overflow-hidden rounded-full bg-[#2A2A3A]">
                <div
                  className="h-2 rounded-full bg-[#22D3EE] transition-all duration-500"
                  style={{ width: `${hpPercent}%` }}
                />
                {hasAttacked && (
                  <div
                    key={`flash-${attackTick}`}
                    className="animate-hp-flash pointer-events-none absolute inset-0 rounded-full bg-white"
                  />
                )}
              </div>
              <p className="text-xs text-[rgba(240,237,232,0.5)]">
                {currentBoss.currentHp} HP · Deadline: {currentBoss.deadline}
              </p>
            </div>
          </section>
        ) : (
          <section className="rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5">
            <p className="text-sm text-[rgba(240,237,232,0.5)]">
              No tienes un boss activo. Pronto podrás crear uno.
            </p>
          </section>
        )}

        {/* Misiones del día */}
        <section className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-widest text-[#22D3EE]">
            Misiones de hoy
          </h3>
          {missions.length === 0 ? (
            <p className="text-sm text-[rgba(240,237,232,0.5)]">
              Completa tu rutina base en Módulo 03 para ver tus misiones.
            </p>
          ) : (
            <ul className="space-y-2">
              {missions.map((mission) => (
                <li
                  key={mission.key}
                  className="flex items-center justify-between rounded-lg border border-[#2A2A3A] bg-[#1A1A26] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-sm">
                      {mission.markedAt ? "✓" : "○"}
                    </span>
                    <div>
                      <p
                        className={`text-sm ${mission.markedAt ? "line-through text-[rgba(240,237,232,0.4)]" : "text-[#F0EDE8]"}`}
                      >
                        {mission.habitText}
                      </p>
                      <p className="text-xs text-[rgba(240,237,232,0.4)]">
                        {mission.isCore
                          ? `−${mission.damageAmount} HP core`
                          : `−${mission.damageAmount} HP`}
                      </p>
                    </div>
                  </div>
                  {!mission.markedAt && (
                    <button
                      type="button"
                      onClick={() => void handleAttack(mission)}
                      className="rounded-lg bg-[#C9A84C] px-3 py-1 text-xs font-bold text-[#0D0D14]"
                    >
                      ⚔️ Hecho
                    </button>
                  )}
                  {mission.markedAt && (
                    <span className="text-xs text-[rgba(240,237,232,0.4)]">
                      ya registrado
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* CTA check-in nocturno */}
        {!checkinClosed && (
          <section className="space-y-2 rounded-xl border border-[#C9A84C] bg-[#1A1A26] p-5 text-center">
            <p className="text-xs font-bold uppercase tracking-widest text-[#C9A84C]">
              Check-in nocturno pendiente
            </p>
            <p className="text-xs text-[rgba(240,237,232,0.5)]">
              Cierra tu día · 2 min
            </p>
            <Link
              href="/modulo04/checkin"
              className="mt-2 block w-full rounded-xl bg-[#C9A84C] py-3 text-sm font-bold text-[#0D0D14]"
            >
              Cerrar mi día →
            </Link>
          </section>
        )}

        {checkinClosed && (
          <section className="rounded-xl border border-[#22D3EE] bg-[#1A1A26] p-5 text-center">
            <p className="text-sm font-bold text-[#22D3EE]">✓ Día cerrado</p>
            <Link
              href="/modulo04/journal"
              className="mt-2 block text-xs text-[rgba(240,237,232,0.5)] underline"
            >
              Escribir en el journal →
            </Link>
          </section>
        )}
      </div>
    </div>
  );
}
