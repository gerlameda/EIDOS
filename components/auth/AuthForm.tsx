"use client";

import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export type AuthFormVariant = "login" | "onboarding";

interface AuthFormProps {
  variant: AuthFormVariant;
}

export function AuthForm({ variant }: AuthFormProps) {
  const label =
    variant === "onboarding"
      ? "Crear cuenta con Google →"
      : "Continuar con Google →";
  const title =
    variant === "onboarding" ? "Empieza tu juego." : "Continúa tu camino.";
  const subtitle =
    variant === "onboarding"
      ? "Crea tu cuenta para guardar tu progreso."
      : "Inicia sesión para seguir donde te quedaste.";

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
            {title}
          </h1>
          <p
            className="mt-4 text-sm"
            style={{ color: "rgba(240,237,232,0.6)" }}
          >
            {subtitle}
          </p>
        </div>
        <GoogleAuthButton label={label} />
      </div>
    </main>
  );
}
