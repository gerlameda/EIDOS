"use client";

import { EidosAvatar } from "@/components/avatar/EidosAvatar";
import { useBossStore } from "@/store/bossStore";
import type { Capa1AvatarTier } from "@/lib/modulo01/capa1-flow-data";
import type { Boss } from "@/types/boss";

interface PerfilClientProps {
  nombre: string;
  nivel: number;
  nivelLabel: string;
  tier: Capa1AvatarTier;
  manifiesto: { lines: [string, string, string] } | null;
  boss: Boss | null;
}

export default function PerfilClient({
  nombre,
  nivel,
  nivelLabel,
  tier,
  manifiesto,
  boss,
}: PerfilClientProps) {
  const streakDays = useBossStore((s) => s.streakDays);

  return (
    <div className="px-5 py-6 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-8">
        {/* Avatar + identidad */}
        <section className="flex flex-col items-center gap-4 pt-4">
          <EidosAvatar tier={tier} className="h-[120px] w-[86px]" />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-[#F0EDE8]">{nombre}</h1>
            <p className="text-sm text-[#C9A84C]">{nivelLabel}</p>
            <p className="text-xs text-[rgba(240,237,232,0.4)]">Nivel {nivel}</p>
          </div>
          {streakDays > 0 && (
            <div className="rounded-full border border-[#2A2A3A] bg-[#1A1A26] px-4 py-1">
              <p className="text-xs font-bold text-[#C9A84C]">
                🔥 {streakDays} días de racha
              </p>
            </div>
          )}
        </section>

        {/* Manifiesto */}
        {manifiesto && (
          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Tu manifiesto
            </p>
            <div className="space-y-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5">
              <p className="text-sm text-[#F0EDE8]">{manifiesto.lines[0]}</p>
              <p className="text-sm text-[#C9A84C]">{manifiesto.lines[1]}</p>
              <p className="text-sm text-[#22D3EE]">{manifiesto.lines[2]}</p>
            </div>
          </section>
        )}

        {/* Boss activo */}
        {boss && (
          <section className="space-y-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Boss activo
            </p>
            <div className="space-y-3 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5">
              <p className="text-xs italic text-[rgba(240,237,232,0.5)]">
                {`"${boss.tauntPhrases[boss.phase]}"`}
              </p>
              <h2 className="text-base font-bold uppercase tracking-wider text-[#F0EDE8]">
                {boss.name}
              </h2>
              <div className="space-y-1">
                <div className="h-1.5 w-full rounded-full bg-[#2A2A3A]">
                  <div
                    className="h-1.5 rounded-full bg-[#22D3EE] transition-all duration-500"
                    style={{
                      width: `${Math.round((boss.currentHp / boss.maxHp) * 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-[rgba(240,237,232,0.4)]">
                  {boss.currentHp} / {boss.maxHp} HP · Deadline: {boss.deadline}
                </p>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
