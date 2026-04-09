"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

export type MagicLinkFormVariant = "login" | "onboarding";

interface MagicLinkFormProps {
  variant: MagicLinkFormVariant;
}

export function MagicLinkForm({ variant }: MagicLinkFormProps) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    let linkedAnonymousWithEmail = false;

    if (variant === "onboarding") {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        console.log(
          "[EIDOS] MagicLinkForm user:",
          user?.id,
          "is_anonymous:",
          user?.is_anonymous,
        );
        if (user?.is_anonymous) {
          // Forzamos modulo03Completed: false al sincronizar en este punto del
          // onboarding. El usuario aún no ha completado nada — esto previene que
          // datos obsoletos del sessionStorage (de sesiones anteriores) corrompan
          // la redirección post-magic-link hacia el juego.
          await syncProfileToSupabase({
            ...useOnboardingStore.getState(),
            modulo03Completed: false,
          });
          const { error: otpErr } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: `${window.location.origin}/auth/confirm`,
              shouldCreateUser: true,
            },
          });
          if (!otpErr) {
            linkedAnonymousWithEmail = true;
          }
        }
      } catch {
        /* silencioso */
      }
    }

    if (linkedAnonymousWithEmail) {
      setSent(true);
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
      console.error(
        "[EIDOS] signInWithOtp error:",
        signInError.message,
        signInError.status,
      );
      setError("Hubo un error. Intenta de nuevo.");
      setLoading(false);
      return;
    }

    setSent(true);
    setLoading(false);
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#0D0D14" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-12 text-center">
          <p
            className="mb-3 text-xs tracking-[0.3em]"
            style={{ color: "#22D3EE" }}
          >
            EIDOS
          </p>
          <h1 className="text-2xl font-light" style={{ color: "#F0EDE8" }}>
            Tu sistema personal
          </h1>
        </div>

        {!sent ? (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs"
                style={{ color: "rgba(240,237,232,0.6)" }}
              >
                Tu correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="nombre@correo.com"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "#1A1A26",
                  border: "1px solid #2A2A3A",
                  color: "#F0EDE8",
                }}
              />
            </div>

            {error ? (
              <p className="text-xs" style={{ color: "#EF4444" }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || !email}
              className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
            >
              {loading ? "Enviando..." : "Continuar con magic link →"}
            </button>

            <p
              className="text-center text-xs"
              style={{ color: "rgba(240,237,232,0.4)" }}
            >
              Sin contraseña. Te enviamos un link al correo.
            </p>
          </form>
        ) : (
          <div className="space-y-4 text-center">
            <div className="text-4xl">✉</div>
            <p style={{ color: "#F0EDE8" }}>Revisa tu correo</p>
            <p className="text-sm" style={{ color: "rgba(240,237,232,0.6)" }}>
              Enviamos un link a <strong>{email}</strong>. Haz click en el para
              entrar.
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              className="text-xs underline"
              style={{ color: "rgba(240,237,232,0.4)" }}
            >
              Usar otro correo
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
