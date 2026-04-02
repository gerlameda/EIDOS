"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useOnboardingStore } from "@/store/onboardingStore";

export function SaveProfilePrompt({
  visible,
  onDismiss,
}: {
  visible: boolean;
  onDismiss: () => void;
}) {
  const supabase = useMemo(() => createClient(), []);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSave() {
    const e = email.trim();
    if (!e) {
      setError("Introduce tu correo.");
      return;
    }
    setError(null);
    setSending(true);
    setSent("sending");

    // Guardar estado temporal antes de enviar el magic link.
    // Motivo: al abrir el callback en otra pestaña, `sessionStorage` puede venir vacío.
    const currentState = useOnboardingStore.getState();
    localStorage.setItem(
      "eidos-pending-save",
      JSON.stringify({
        nombre: currentState.nombre,
        nivel: currentState.nivel,
        areaPrioritaria: currentState.areaPrioritaria,
        capa1Saved: currentState.capa1Saved,
        capa2Areas: currentState.capa2Areas,
        visionAreas: currentState.visionAreas,
        criticalHabits: currentState.criticalHabits,
        manifiesto: currentState.manifiesto,
        rutinaBase: currentState.rutinaBase,
        sprintCommitments: currentState.sprintCommitments,
        modulo03Completed: currentState.modulo03Completed,
      }),
    );

    localStorage.setItem("eidos-auth-redirect", "/modulo03/cierre");

    const redirectTo = `${window.location.origin}/auth/confirm`;

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email: e,
      options: { emailRedirectTo: redirectTo },
    });

    setSending(false);

    if (signInError) {
      setSent("idle");
      setError("Hubo un error. Intenta de nuevo.");
      return;
    }

    setSent("sent");
  }

  if (!visible) return null;

  return (
    <section
      className="fixed inset-x-0 bottom-0 z-50 border-t border-[#2A2A3A] bg-[#0D0D14]/95 px-6 py-5 backdrop-blur"
      aria-modal
      role="dialog"
    >
      <div className="mx-auto w-full max-w-2xl">
        <div className="space-y-4 rounded-xl border border-[#2A2A3A] bg-[#0D0D14]/40 p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-cyan">
            GUARDA TU PROGRESO
          </p>

          <h2 className="text-xl font-semibold text-text-primary">
            No pierdas lo que construiste.
          </h2>

          <p className="text-sm leading-relaxed text-[rgba(240,237,232,0.6)]">
            Ingresa tu email y te enviamos un link para acceder a tu perfil
            desde cualquier lugar.
          </p>

          <label className="block">
            <span className="sr-only">Correo</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="nombre@correo.com"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: "#1A1A26",
                border: "1px solid #2A2A3A",
                color: "#F0EDE8",
              }}
              onFocus={(e) => {
                e.currentTarget.style.borderColor = "#22D3EE";
              }}
              onBlur={(e) => {
                e.currentTarget.style.borderColor = "#2A2A3A";
              }}
            />
          </label>

          <button
            type="button"
            onClick={() => void handleSave()}
            disabled={sending}
            className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-colors duration-200 hover:bg-accent-cyan/20 disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Guardar mi perfil →"}
          </button>

          {sent === "sent" ? (
            <p className="text-center text-sm text-text-primary">
              Revisa tu correo — te enviamos el link.
            </p>
          ) : null}

          {error ? (
            <p className="text-center text-xs text-red-400">{error}</p>
          ) : null}

          <button
            type="button"
            onClick={onDismiss}
            className="block w-full text-center text-sm font-medium text-[rgba(240,237,232,0.6)] transition-colors hover:text-text-primary"
          >
            Continuar sin guardar
          </button>
        </div>
      </div>
    </section>
  );
}

