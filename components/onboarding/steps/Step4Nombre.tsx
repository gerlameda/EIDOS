"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

export function Step4Nombre() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();
  const stored = useOnboardingStore((s) => s.nombre);
  const setNombre = useOnboardingStore((s) => s.setNombre);
  const [value, setValue] = useState(stored);

  const continuar = useCallback(() => {
    const n = value.trim();
    if (!n) return;
    setNombre(n);
    router.push("/onboarding/5");
  }, [value, setNombre, router]);

  useEffect(() => {
    setHandlers({
      canGoNext: () => value.trim().length > 0,
      goNext: continuar,
    });
    return () => setHandlers(null);
  }, [setHandlers, value, continuar]);

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-md text-center md:text-left">
        <h1 className="text-2xl font-semibold text-text-primary md:text-3xl">
          ¿Cuál es tu nombre, jugador?
        </h1>
        <input
          type="text"
          autoComplete="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              continuar();
            }
          }}
          className="mt-10 w-full rounded-lg border border-text-muted/40 bg-bg-base px-4 py-3 text-center text-lg text-text-primary outline-none transition-colors focus:border-accent-cyan md:text-left"
          placeholder="Tu nombre"
        />
        <button
          type="button"
          onClick={continuar}
          disabled={!value.trim()}
          className="mt-8 w-full rounded-lg border border-accent-cyan py-3 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 disabled:opacity-40 md:w-auto md:px-10"
        >
          Continuar →
        </button>
      </div>
    </div>
  );
}
