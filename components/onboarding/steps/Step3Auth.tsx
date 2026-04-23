"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";
import { createClient } from "@/lib/supabase/client";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

type AuthMode = "signup" | "login";

const inputBaseStyle: CSSProperties = {
  backgroundColor: "#1A1A26",
  border: "1px solid #2A2A3A",
  color: "#F0EDE8",
};

const labelClass = "mb-2 block text-xs text-[rgba(240,237,232,0.6)]";

export function Step3Auth() {
  const { setHandlers } = useOnboardingNavRegistration();
  const [mode, setMode] = useState<AuthMode>("signup");
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

  const switchMode = useCallback(() => {
    setMode((m) => (m === "signup" ? "login" : "signup"));
    setError(null);
  }, []);

  const handleSubmit = useCallback(
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
      try {
        const supabase = createClient();

        if (mode === "signup") {
          const { data, error: signUpError } = await supabase.auth.signUp({
            email: trimmed,
            password,
          });

          console.log("[EIDOS] signUp data:", data);
          console.log("[EIDOS] signUp error:", signUpError);

          if (signUpError) {
            setError(signUpError.message);
            setLoading(false);
            return;
          }

          if (!data.session) {
            console.warn(
              "[EIDOS] signUp devolvió user sin session — revisa 'Confirm email' en Supabase",
            );
            setError(
              "Cuenta creada pero sin sesión. Revisa la configuración de Supabase (Confirm email debe estar OFF).",
            );
            setLoading(false);
            return;
          }

          // Persistimos el estado actual del onboarding ANTES del full-reload.
          await syncProfileToSupabase(useOnboardingStore.getState());
          window.location.href = "/onboarding/4";
          return;
        }

        // mode === "login"
        const { data, error: signInError } =
          await supabase.auth.signInWithPassword({
            email: trimmed,
            password,
          });

        console.log("[EIDOS] signIn data:", data);
        console.log("[EIDOS] signIn error:", signInError);

        if (signInError) {
          setError(signInError.message);
          setLoading(false);
          return;
        }

        if (!data.session) {
          setError("No se pudo iniciar sesión. Intenta de nuevo.");
          setLoading(false);
          return;
        }

        // Full reload para que el middleware y los RSC recojan la cookie de sesión.
        // El hook useSupabaseSync hidratará el store desde Supabase al recargar.
        window.location.href = "/campo-base";
      } catch (err) {
        console.error(`[EIDOS] ${mode} threw:`, err);
        setError("Error inesperado. Intenta de nuevo.");
        setLoading(false);
      }
    },
    [email, password, mode],
  );

  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && !loading;

  const isSignup = mode === "signup";
  const title = isSignup ? "Empieza tu juego." : "Continúa tu camino.";
  const subtitle = isSignup
    ? "Crea tu cuenta para guardar tu progreso."
    : "Inicia sesión para seguir donde te quedaste.";
  const submitLabel = isSignup ? "Crear cuenta →" : "Entrar →";
  const toggleText = isSignup ? "¿Ya tienes cuenta?" : "¿Eres nuevo?";
  const toggleCta = isSignup ? "Inicia sesión" : "Crea tu cuenta";

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md text-center md:text-left">
        <h1 className="text-2xl font-semibold text-text-primary">{title}</h1>
        <p className="mt-6 text-sm text-text-muted">{subtitle}</p>

        <form onSubmit={(e) => void handleSubmit(e)} className="mt-8 space-y-4">
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
              autoComplete={isSignup ? "new-password" : "current-password"}
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
            {loading ? "Cargando…" : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-xs text-text-muted md:text-left">
          {toggleText}{" "}
          <button
            type="button"
            onClick={switchMode}
            disabled={loading}
            className="font-medium underline underline-offset-2 transition-opacity disabled:opacity-40"
            style={{ color: "#22D3EE" }}
          >
            {toggleCta}
          </button>
        </p>
      </div>
    </div>
  );
}
