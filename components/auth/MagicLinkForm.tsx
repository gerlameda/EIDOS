"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  EIDOS_PENDING_PROFILE_COOKIE,
  EIDOS_PENDING_PROFILE_MAX_AGE_SEC,
  type EidosProfileSyncPayload,
} from "@/lib/onboarding/profile-sync-payload";
import { useOnboardingStore } from "@/store/onboardingStore";

export type MagicLinkFormVariant = "login" | "onboarding";

function profilePayloadFromStore(): EidosProfileSyncPayload {
  const s = useOnboardingStore.getState();
  return {
    nombre: s.nombre,
    nivel: s.nivel,
    area_prioritaria: s.areaPrioritaria,
    capa1_saved: s.capa1Saved,
    capa2_areas: s.capa2Areas,
    vision_areas: s.visionAreas,
    critical_habits: s.criticalHabits,
    manifiesto: s.manifiesto,
    rutina_base: s.rutinaBase,
    sprint_commitments: s.sprintCommitments,
    modulo03_completed: s.modulo03Completed,
  };
}

function setPendingProfileCookie(payload: EidosProfileSyncPayload): void {
  const value = encodeURIComponent(JSON.stringify(payload));
  const secure =
    typeof window !== "undefined" && window.location.protocol === "https:"
      ? "; Secure"
      : "";
  document.cookie = `${EIDOS_PENDING_PROFILE_COOKIE}=${value}; Path=/; Max-Age=${EIDOS_PENDING_PROFILE_MAX_AGE_SEC}; SameSite=Lax${secure}`;
}

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

    if (variant === "onboarding") {
      try {
        const syncClient = createClient();
        const payload = profilePayloadFromStore();
        const {
          data: { user },
        } = await syncClient.auth.getUser();
        if (user) {
          await syncClient.from("eidos_profiles").upsert(
            {
              id: user.id,
              ...payload,
            },
            { onConflict: "id" },
          );
        } else {
          setPendingProfileCookie(payload);
        }
      } catch {
        /* sync opcional — no bloquear el OTP */
      }
    }

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signInError) {
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
