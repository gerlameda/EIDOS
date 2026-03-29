"use client";

import { useEffect, useState } from "react";
import { useOnboardingStore } from "@/store/onboardingStore";
import { OnboardingScreenErrorBoundary } from "@/components/onboarding/OnboardingScreenErrorBoundary";
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
  const showWelcome = phase === "welcome";
  const showChronicles = phase === "chronicles";

  return (
    <OnboardingScreenErrorBoundary>
      <div className="flex min-h-full flex-1 flex-col items-center justify-center text-center">
        <div className="relative grid min-h-[11rem] w-full max-w-xl place-items-center">
          <p
            className={`col-start-1 row-start-1 max-w-full transition-all duration-500 ease-in-out motion-reduce:transition-none ${
              showWelcome
                ? "translate-y-0 opacity-100"
                : "pointer-events-none translate-y-2 opacity-0"
            } text-2xl font-medium leading-relaxed text-text-primary md:text-3xl`}
            aria-hidden={!showWelcome}
          >
            Saludos, {displayName}. Tu juego empieza ahora.
          </p>
          <p
            className={`col-start-1 row-start-1 max-w-full transition-all duration-500 ease-in-out motion-reduce:transition-none ${
              showChronicles
                ? "translate-y-0 opacity-100"
                : "pointer-events-none -translate-y-2 opacity-0"
            } text-center text-3xl font-semibold tracking-tight text-accent-gold md:text-4xl`}
            aria-hidden={!showChronicles}
          >
            {displayName} Chronicles
          </p>
        </div>
      </div>
    </OnboardingScreenErrorBoundary>
  );
}
