"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";
import { createClient } from "@/lib/supabase/client";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

const inputBaseStyle: CSSProperties = {
  backgroundColor: "#1A1A26",
  border: "1px solid #2A2A3A",
  color: "#F0EDE8",
};

const labelClass =
  "mb-2 block text-xs text-[rgba(240,237,232,0.6)]";

export function Step3Auth() {
  const { setHandlers } = useOnboardingNavRegistration();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setHandlers({
      canGoNext: () => false,
    });
    return () => setHandlers(null);
  }, [setHandlers]);

  const handleCrearCuenta = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);

      const trimmed = email.trim();
      if (!trimmed || password.length < 6) {
        if (password.length < 6) {
          setError("La contraseña debe tener al menos 6 caracteres.");
        }
        return;
      }

      setLoading(true);
      const supabase = createClient();
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("[EIDOS] signUp data:", JSON.stringify(data));
      console.log("[EIDOS] signUp error:", signUpError);

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.session) {
        syncProfileToSupabase(useOnboardingStore.getState()).catch(
          console.error,
        );
        window.location.href = "/onboarding/4";
        return;
      }

      if (data.user && !data.session) {
        console.log("[EIDOS] user created but no session - confirm email might be ON");
        setError("Cuenta creada pero sin sesión. Verifica config de Supabase.");
        setLoading(false);
        return;
      }

      setError("Hubo un error, intenta de nuevo.");
      setLoading(false);
    },
    [email, password],
  );

  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && !loading;

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md text-center md:text-left">
        <h1 className="text-2xl font-semibold text-text-primary">
          Empieza tu juego.
        </h1>
        <p className="mt-6 text-sm text-text-muted">
          Crea tu cuenta para guardar tu progreso.
        </p>

        <form
          onSubmit={(e) => void handleCrearCuenta(e)}
          className="mt-8 space-y-4"
        >
          <div>
            <label className={labelClass} htmlFor="step3-email">
              Correo
            </label>
            <input
              id="step3-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={inputBaseStyle}
            />
          </div>
          <div>
            <label className={labelClass} htmlFor="step3-password">
              Contraseña
            </label>
            <input
              id="step3-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none"
              style={inputBaseStyle}
            />
          </div>

          {error ? (
            <p className="text-xs" style={{ color: "#EF4444" }}>
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={!canSubmit}
            className="w-full rounded-lg py-3 font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
          >
            {loading ? "Cargando…" : "Crear cuenta →"}
          </button>
        </form>
      </div>
    </div>
  );
}
