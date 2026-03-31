"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/store/onboardingStore";

export default function Modulo03IntroPage() {
  const router = useRouter();
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (visionAreas.length < 5) {
      router.replace("/modulo02/areas/salud");
    }
  }, [router, visionAreas.length]);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, []);

  if (visionAreas.length < 5) return null;

  return (
    <main className="min-h-screen bg-[#0D0D14] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)] px-6 py-8 text-[#F0EDE8]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col">
        <p
          className={
            "text-xs uppercase tracking-[0.2em] text-accent-cyan transition-all duration-500 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
          style={{ transitionDelay: "0ms" }}
        >
          Módulo 03
        </p>

        <div className="my-auto space-y-5">
          <h1
            className={
              "text-4xl font-semibold text-accent-gold transition-all duration-500 md:text-5xl " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "200ms" }}
          >
            El mapa está completo.
          </h1>
          <h2
            className={
              "text-2xl font-light leading-tight text-text-primary transition-all duration-500 md:text-3xl " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "400ms" }}
          >
            Ahora construimos el camino.
          </h2>
          <p
            className={
              "max-w-lg text-base leading-relaxed text-[rgba(240,237,232,0.6)] transition-all duration-500 " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "600ms" }}
          >
            Tres pasos: tu por qué, tu sistema, tu primer sprint. Al final de
            este módulo tienes todo lo que necesitas para empezar hoy.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/modulo03/porque")}
          className={
            "w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-all duration-500 hover:bg-accent-cyan/20 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
          style={{ transitionDelay: "800ms" }}
        >
          Construir mi sistema →
        </button>
      </div>
    </main>
  );
}
