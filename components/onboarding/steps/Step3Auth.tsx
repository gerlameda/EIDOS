"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

export function Step3Auth() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    setHandlers({
      canGoNext: () => false,
    });
    return () => setHandlers(null);
  }, [setHandlers]);

  async function crearCuenta() {
    setMessage(null);
    if (!email.trim()) {
      setMessage("Introduce tu correo.");
      return;
    }
    if (password.length < 6) {
      setMessage("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding/4`,
      },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    router.push("/onboarding/4");
  }

  async function enviarMagicLink() {
    setMessage(null);
    if (!email.trim()) {
      setMessage("Introduce tu correo para el enlace.");
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/onboarding/4`,
      },
    });
    setBusy(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Revisa tu correo para el enlace.");
  }

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md">
        <h1 className="text-center text-2xl font-semibold text-text-primary md:text-3xl">
          Empieza tu juego.
        </h1>

        <div className="mt-10 space-y-4">
          <label className="block text-sm text-text-muted">
            Correo electrónico
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-lg border border-text-muted/40 bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors focus:border-accent-cyan"
              placeholder="tu@email.com"
            />
          </label>
          <label className="block text-sm text-text-muted">
            Contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-lg border border-text-muted/40 bg-bg-base px-4 py-3 text-text-primary outline-none transition-colors focus:border-accent-cyan"
              placeholder="••••••••"
            />
          </label>

          <button
            type="button"
            disabled={busy}
            onClick={() => void crearCuenta()}
            className="w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/20 disabled:opacity-50"
          >
            Crear cuenta →
          </button>
        </div>

        <div className="my-8 flex items-center gap-4">
          <div className="h-px flex-1 bg-text-muted/30" />
          <span className="text-sm text-text-muted">o</span>
          <div className="h-px flex-1 bg-text-muted/30" />
        </div>

        <button
          type="button"
          disabled={busy}
          onClick={() => void enviarMagicLink()}
          className="w-full rounded-lg border border-text-muted/50 py-3 text-text-primary transition-colors hover:border-accent-cyan/60 hover:text-accent-cyan disabled:opacity-50"
        >
          Recibir link por email
        </button>

        {message ? (
          <p className="mt-6 text-center text-sm text-text-muted">{message}</p>
        ) : null}

        <button
          type="button"
          onClick={() => router.push("/onboarding/4")}
          className="mt-8 w-full text-center text-xs text-text-muted"
        >
          Continuar sin cuenta →
        </button>
      </div>
    </div>
  );
}
