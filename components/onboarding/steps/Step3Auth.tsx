"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

export function Step3Auth() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();

  useEffect(() => {
    setHandlers({
      canGoNext: () => true,
    });
    return () => setHandlers(null);
  }, [setHandlers]);

  const continuar = useCallback(() => {
    router.push("/onboarding/4");
  }, [router]);

  useEffect(() => {
    setHandlers({
      canGoNext: () => true,
      goNext: continuar,
    });
    return () => setHandlers(null);
  }, [setHandlers, continuar]);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md text-center md:text-left">
        <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">
          Continúa sin cuenta.
        </h1>

        <p className="mt-6 text-sm leading-relaxed text-text-muted">
          Completa tu onboarding y guarda tu progreso al final del arco.
        </p>

        <button
          type="button"
          onClick={continuar}
          className="mt-8 w-full rounded-lg border border-accent-cyan py-3 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 md:w-auto md:px-10"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
