"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function Modulo02IntroPage() {
  const router = useRouter();
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), 40);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="min-h-screen bg-[#0D0D14] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.05),transparent_55%)] px-6 py-8 text-[#F0EDE8]">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-2xl flex-col">
        <p
          data-animate="true"
          className={
            "text-xs uppercase tracking-[0.2em] text-accent-cyan transition-all duration-500 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
          style={{ transitionDelay: "0ms" }}
        >
          Módulo 02
        </p>

        <div className="my-auto space-y-5">
          <h1
            data-animate="true"
            className={
              "text-4xl font-semibold text-accent-gold transition-all duration-500 md:text-5xl " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "200ms" }}
          >
            Ya sabes dónde estás.
          </h1>
          <h2
            data-animate="true"
            className={
              "text-2xl font-light leading-tight text-text-primary transition-all duration-500 md:text-3xl " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "400ms" }}
          >
            Ahora viene lo difícil —<br />
            decidir dónde quieres llegar.
          </h2>
          <p
            data-animate="true"
            className={
              "max-w-lg text-base leading-relaxed text-text-muted transition-all duration-500 " +
              (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
            }
            style={{ transitionDelay: "600ms" }}
          >
            Vamos área por área. El sistema te propone, tú validas. Nunca
            enfrentas un espacio en blanco.
          </p>
        </div>

        <button
          type="button"
          onClick={() => router.push("/modulo02/areas/salud")}
          data-animate="true"
          className={
            "w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 font-medium text-accent-cyan transition-all duration-500 hover:bg-accent-cyan/20 " +
            (show ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0")
          }
          style={{ transitionDelay: "800ms" }}
        >
          Comenzar →
        </button>
      </div>
    </main>
  );
}

