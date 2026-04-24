"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import { useOnboardingStore } from "@/store/onboardingStore";

export type AuthFormVariant = "login" | "onboarding";

interface AuthFormProps {
  variant: AuthFormVariant;
}

export function AuthForm({ variant }: AuthFormProps) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      setLoading(false);
      return;
    }

    const supabase = createClient();

    if (variant === "onboarding") {
      try {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setLoading(false);
          return;
        }

        if (data.session) {
          await syncProfileToSupabase(useOnboardingStore.getState());
          router.push("/onboarding/nombre");
          return;
        }

        setError(
          "Cuenta creada pero sin sesión. Revisa la configuración de Supabase (Confirm email debe estar OFF).",
        );
        setLoading(false);
      } catch (err) {
        console.error("[EIDOS] signUp threw:", err);
        setError("Error inesperado. Intenta de nuevo.");
        setLoading(false);
      }
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return;
    }

    router.push("/campo-base");
  }

  const canSubmit =
    email.trim().length > 0 && password.length >= 6 && !loading;
  const buttonLabel =
    variant === "onboarding" ? "Crear cuenta →" : "Entrar →";

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
              autoComplete="email"
              placeholder="nombre@correo.com"
              className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
              style={{
                backgroundColor: "#1A1A26",
                border: "1px solid #2A2A3A",
                color: "#F0EDE8",
              }}
            />
          </div>

          <div>
            <label
              className="mb-2 block text-xs"
              style={{ color: "rgba(240,237,232,0.6)" }}
            >
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                variant === "onboarding" ? "new-password" : "current-password"
              }
              placeholder="Mínimo 6 caracteres"
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
            disabled={!canSubmit}
            className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
          >
            {loading ? "Cargando…" : buttonLabel}
          </button>

          {variant === "login" ? (
            <div className="pt-2 text-center">
              <Link
                href="/forgot-password"
                className="text-xs underline transition-colors hover:text-[#22D3EE]"
                style={{ color: "rgba(240,237,232,0.55)" }}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          ) : null}
        </form>
      </div>
    </main>
  );
}
