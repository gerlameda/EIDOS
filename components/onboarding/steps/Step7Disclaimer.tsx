"use client";

import { useRouter } from "next/navigation";

export function Step7Disclaimer() {
  const router = useRouter();

  return (
    <div className="flex flex-1 flex-col justify-center">
      <div className="mx-auto w-full max-w-xl text-center md:text-left">
        <p className="text-xl font-medium text-text-primary md:text-2xl">
          Una cosa antes.
        </p>
        <div className="mt-8 space-y-4 text-base leading-relaxed text-text-primary/90 md:text-lg">
          <p>EIDOS es una herramienta de autoconocimiento.</p>
          <p>No reemplaza a un profesional.</p>
          <p>Si estás en crisis, busca ayuda.</p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/onboarding/8")}
          className="mt-12 w-full rounded-lg border border-accent-cyan py-3 font-medium text-accent-cyan transition-colors hover:bg-accent-cyan/10 md:w-auto md:px-8"
        >
          Lo entiendo. Juguemos. →
        </button>
      </div>
    </div>
  );
}
