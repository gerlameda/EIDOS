"use client";

import { useEffect } from "react";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";

export function Step3Auth() {
  const { setHandlers } = useOnboardingNavRegistration();

  useEffect(() => {
    setHandlers({ canGoNext: () => false });
    return () => setHandlers(null);
  }, [setHandlers]);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md text-center md:text-left">
        <h1 className="text-2xl font-semibold text-text-primary">
          Empieza tu juego.
        </h1>
        <p className="mt-6 text-sm text-text-muted">
          Guarda tu progreso con tu cuenta de Google.
        </p>
        <div className="mt-8">
          <GoogleAuthButton label="Continuar con Google →" />
        </div>
      </div>
    </div>
  );
}
