"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

export function Step5Bienvenida() {
  const nombre = useOnboardingStore((s) => s.nombre);
  const { setHandlers } = useOnboardingNavRegistration();
  const [phase, setPhase] = useState<"welcome" | "chronicles">("welcome");

  useEffect(() => {
    const t = window.setTimeout(() => setPhase("chronicles"), 5000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    setHandlers({
      canGoNext: () => phase === "chronicles",
    });
    return () => setHandlers(null);
  }, [setHandlers, phase]);

  const displayName = nombre.trim() || "jugador";

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center text-center">
      <div className="w-full max-w-xl">
        {phase === "welcome" ? (
          <p className="text-2xl font-medium leading-relaxed text-text-primary md:text-3xl">
            Saludos, {displayName}. Tu juego empieza ahora.
          </p>
        ) : (
          <p className="text-center text-3xl font-semibold tracking-tight text-accent-gold md:text-4xl">
            {displayName} Chronicles
          </p>
        )}
      </div>
    </div>
  );
}
