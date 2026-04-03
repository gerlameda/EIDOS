"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createBossInDB } from "@/lib/supabase/createBoss";
import { useBossStore } from "@/store/bossStore";
import type { Boss } from "@/types/boss";

interface PrimerBossProps {
  userId: string;
  proposal: Omit<Boss, "id" | "userId" | "createdAt" | "updatedAt">;
}

export default function PrimerBoss({ userId, proposal }: PrimerBossProps) {
  const router = useRouter();
  const { setActiveBoss } = useBossStore();
  const [name, setName] = useState(proposal.name);
  const [confirming, setConfirming] = useState(false);

  async function handleConfirm() {
    setConfirming(true);
    const finalProposal = { ...proposal, name };
    const boss = await createBossInDB(userId, finalProposal);
    if (boss) {
      setActiveBoss(boss);
      router.push("/modulo04");
    } else {
      setConfirming(false);
    }
  }

  const hpPercent = 100;

  return (
    <main className="min-h-screen bg-[#0D0D14] px-5 py-8 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg space-y-8">
        <header className="space-y-1">
          <p className="text-xs uppercase tracking-widest text-[#22D3EE]">
            Tu primer boss
          </p>
          <h1 className="text-2xl font-bold text-[#F0EDE8]">
            El juego está a punto de comenzar.
          </h1>
          <p className="text-sm text-[rgba(240,237,232,0.5)]">
            EIDOS identificó a tu enemigo principal. Puedes renombrarlo si
            quieres.
          </p>
        </header>

        {/* Boss card */}
        <section className="space-y-4 rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-5">
          <p className="text-xs italic text-[rgba(240,237,232,0.5)]">
            {`"${proposal.tauntPhrases.intimidando}"`}
          </p>

          {/* Nombre editable */}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full border-b border-[#2A2A3A] bg-transparent pb-1 text-xl font-bold uppercase tracking-wider text-[#F0EDE8] outline-none focus:border-[#22D3EE]"
          />

          {/* HP bar */}
          <div className="space-y-1">
            <div className="h-2 w-full rounded-full bg-[#2A2A3A]">
              <div
                className="h-2 rounded-full bg-[#22D3EE]"
                style={{ width: `${hpPercent}%` }}
              />
            </div>
            <p className="text-xs text-[rgba(240,237,232,0.5)]">
              {proposal.maxHp} HP · Deadline: {proposal.deadline}
            </p>
          </div>

          {/* Core attack */}
          <div className="rounded-lg bg-[#0D0D14] px-4 py-3">
            <p className="mb-1 text-xs uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
              Ataque principal
            </p>
            <p className="text-sm text-[#F0EDE8]">{proposal.coreAttack}</p>
          </div>
        </section>

        <button
          type="button"
          onClick={() => void handleConfirm()}
          disabled={confirming || !name.trim()}
          className="w-full rounded-xl bg-[#C9A84C] py-4 text-sm font-bold text-[#0D0D14] disabled:opacity-50"
        >
          {confirming ? "Iniciando..." : "⚔️ Comenzar el juego →"}
        </button>
      </div>
    </main>
  );
}

