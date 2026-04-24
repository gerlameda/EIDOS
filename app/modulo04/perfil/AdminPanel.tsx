"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  adminFullResetAction,
  adminMarkCheckinCompletedAction,
  adminReopenCheckinAction,
} from "./adminActions";

/**
 * Panel de herramientas "admin" del usuario — atajos para corregir estado
 * cuando algo se atora (olvidé cerrar el día, quiero re-hacer el check-in,
 * quiero volver al onboarding, etc).
 *
 * Todos los botones son opt-in y los destructivos piden confirmación nativa.
 */
export default function AdminPanel() {
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [flash, setFlash] = useState<{
    kind: "ok" | "err";
    text: string;
  } | null>(null);

  function show(kind: "ok" | "err", text: string) {
    setFlash({ kind, text });
    window.setTimeout(() => setFlash(null), 2500);
  }

  async function handleMarkCompleted() {
    setBusy("mark");
    try {
      const r = await adminMarkCheckinCompletedAction();
      if (r.ok) {
        show("ok", "Check-in de hoy marcado como completado.");
        router.refresh();
      } else {
        show("err", r.error ?? "No se pudo marcar.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleReopen() {
    const ok = window.confirm(
      "¿Reabrir el check-in de hoy? Borra el row de hoy para que lo puedas hacer de nuevo.",
    );
    if (!ok) return;
    setBusy("reopen");
    try {
      const r = await adminReopenCheckinAction();
      if (r.ok) {
        show("ok", "Check-in de hoy reabierto.");
        router.refresh();
      } else {
        show("err", r.error ?? "No se pudo reabrir.");
      }
    } finally {
      setBusy(null);
    }
  }

  async function handleFullReset() {
    const first = window.confirm(
      "⚠️ FULL RESET\n\nEsto borra TODO tu onboarding, hábitos, bosses, check-ins, journals y agenda. Tu cuenta (email/password) sigue viva, pero vuelves a empezar desde cero.\n\n¿Seguro?",
    );
    if (!first) return;
    const confirm = window.prompt(
      'Escribe RESET en mayúsculas para confirmar:',
    );
    if (confirm !== "RESET") {
      show("err", "Cancelado (no escribiste RESET).");
      return;
    }
    setBusy("reset");
    try {
      const r = await adminFullResetAction();
      if (r.ok) {
        show("ok", "Reset completo. Redirigiendo…");
        window.setTimeout(() => {
          router.push("/onboarding");
          router.refresh();
        }, 600);
      } else {
        show("err", r.error ?? "No se pudo resetear.");
      }
    } finally {
      setBusy(null);
    }
  }

  const btnBase =
    "inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-40";

  return (
    <section className="space-y-3">
      <p className="text-[10px] font-bold uppercase tracking-widest text-[rgba(240,237,232,0.5)]">
        Admin
      </p>
      <div className="rounded-xl border border-[#2A2A3A] bg-[#1A1A26] p-4">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => void handleMarkCompleted()}
            disabled={busy !== null}
            className={`${btnBase} border-[#2A2A3A] bg-[#0D0D14] text-[#F0EDE8] hover:border-[#22D3EE]/60`}
          >
            📅 {busy === "mark" ? "Marcando…" : "Marcar check-in de hoy"}
          </button>

          <button
            type="button"
            onClick={() => void handleReopen()}
            disabled={busy !== null}
            className={`${btnBase} border-[#2A2A3A] bg-[#0D0D14] text-[#F0EDE8] hover:border-[#C9A84C]/60`}
          >
            🔓 {busy === "reopen" ? "Reabriendo…" : "Reabrir check-in de hoy"}
          </button>

          <Link
            href="/modulo04/journal"
            className={`${btnBase} border-[#2A2A3A] bg-[#0D0D14] text-[#F0EDE8] hover:border-[#22D3EE]/60`}
          >
            📓 Editar journal de hoy
          </Link>

          <button
            type="button"
            onClick={() => void handleFullReset()}
            disabled={busy !== null}
            className={`${btnBase} border-[#EF4444]/60 bg-[#EF4444] text-[#F0EDE8] hover:bg-[#DC2626]`}
          >
            {busy === "reset" ? "Reseteando…" : "Full reset"}
          </button>
        </div>

        {flash ? (
          <p
            className={`mt-3 text-xs ${
              flash.kind === "ok" ? "text-[#22D3EE]" : "text-[#EF4444]"
            }`}
          >
            {flash.text}
          </p>
        ) : null}

        <p className="mt-3 text-[11px] text-[rgba(240,237,232,0.4)]">
          Estas acciones son para rescatarte si el estado se atora. El full
          reset es irreversible.
        </p>
      </div>
    </section>
  );
}
