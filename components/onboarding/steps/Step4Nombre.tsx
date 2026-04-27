"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { syncProfileToSupabase } from "@/lib/onboarding/sync-profile";
import {
  normalizeNombreUsuario,
  useOnboardingStore,
} from "@/store/onboardingStore";
import { useOnboardingNavRegistration } from "@/components/onboarding/onboarding-nav-context";

export function Step4Nombre() {
  const router = useRouter();
  const { setHandlers } = useOnboardingNavRegistration();
  const stored = useOnboardingStore((s) => s.nombre);
  const setNombre = useOnboardingStore((s) => s.setNombre);
  const [value, setValue] = useState(stored);

  const continuar = useCallback(() => {
    const n = normalizeNombreUsuario(value);
    if (!n) return;
    setNombre(n);
    void syncProfileToSupabase(useOnboardingStore.getState());
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
          ¿Cuál es tu nombre de héroe?
        </h1>
        <p className="mt-3 text-sm text-text-muted">
          Así te llamará Eidos a lo largo del viaje.
        </p>
        <input
          type="text"
          autoComplete="name"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={() => setValue((v) => normalizeNombreUsuario(v))}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              continuar();
            }
          }}
          className="mt-8 w-full rounded-lg border border-text-muted/40 bg-bg-base px-4 py-3 text-center text-lg text-text-primary outline-none transition-colors focus:border-accent-cyan md:text-left"
          placeholder="Tu nombre de héroe"
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
