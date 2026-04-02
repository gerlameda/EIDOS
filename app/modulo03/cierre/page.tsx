"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { EidosAvatar } from "@/components/avatar/EidosAvatar";
import { AREA_LABELS, AREA_ORDER } from "@/lib/modulo02/areas";
import { capa1GlobalNivelFromSaved } from "@/lib/modulo01/capa1-flow-data";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { DayOfWeek } from "@/types/modulo03";
import { SaveProfilePrompt } from "@/components/SaveProfilePrompt";

const DAY_SHORT: Record<DayOfWeek, string> = {
  lun: "L",
  mar: "M",
  mié: "X",
  jue: "J",
  vie: "V",
  sáb: "S",
  dom: "D",
};

function truncate(s: string, max: number) {
  const t = s.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trimEnd()}…`;
}

function timeLabel(t: string) {
  if (t === "mañana") return "Mañana";
  if (t === "tarde") return "Tarde";
  return "Noche";
}

export default function Modulo03CierrePage() {
  const router = useRouter();
  const nombre = useOnboardingStore((s) => s.nombre);
  const capa1Saved = useOnboardingStore((s) => s.capa1Saved);
  const visionAreas = useOnboardingStore((s) => s.visionAreas);
  const manifiesto = useOnboardingStore((s) => s.manifiesto);
  const sprintCommitments = useOnboardingStore((s) => s.sprintCommitments);
  const modulo03Completed = useOnboardingStore((s) => s.modulo03Completed);

  const [visible, setVisible] = useState({
    headline: false,
    manifiesto: false,
    vision: false,
    sprint: false,
    avatar: false,
    cta: false,
    savePrompt: false,
  });

  useEffect(() => {
    const hasPendingSave =
      typeof window !== "undefined" &&
      localStorage.getItem("eidos-pending-save") !== null;

    if (!modulo03Completed && !hasPendingSave) {
      router.replace("/modulo03");
    }
  }, [modulo03Completed, router]);

  useEffect(() => {
    const timers = [
      setTimeout(
        () => setVisible((v) => ({ ...v, headline: true })),
        0,
      ),
      setTimeout(
        () => setVisible((v) => ({ ...v, manifiesto: true })),
        600,
      ),
      setTimeout(() => setVisible((v) => ({ ...v, vision: true })), 1400),
      setTimeout(() => setVisible((v) => ({ ...v, sprint: true })), 2000),
      setTimeout(() => setVisible((v) => ({ ...v, avatar: true })), 2800),
      setTimeout(() => setVisible((v) => ({ ...v, cta: true })), 3400),
      setTimeout(() => setVisible((v) => ({ ...v, savePrompt: true })), 3600),
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  const global = capa1GlobalNivelFromSaved(capa1Saved);
  const tier = global?.tier ?? "low";
  const nivelLabel = global?.nivelLabel ?? "—";

  if (!modulo03Completed || !manifiesto) return null;

  const headlineName = nombre.trim()
    ? `${nombre}, tu sistema está vivo.`
    : "Tu sistema está vivo.";

  return (
    <main className="min-h-screen bg-[#0D0D14] px-6 py-10 text-[#F0EDE8] md:px-8">
      <div className="mx-auto w-full max-w-2xl space-y-10">
        <header
          className={
            "space-y-3 text-center transition-all duration-500 " +
            (visible.headline
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <p className="text-xs uppercase tracking-[0.2em] text-accent-cyan">
            Arco fundacional completo
          </p>
          <h1 className="text-3xl font-semibold text-accent-gold md:text-4xl">
            {headlineName}
          </h1>
        </header>

        <div className="border-t border-[#2A2A3A]" />

        <section
          className={
            "space-y-4 transition-all duration-500 " +
            (visible.manifiesto
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent-cyan">
            Tu manifiesto
          </p>
          <div className="space-y-4 text-lg font-light leading-relaxed">
            <p className="text-[#F0EDE8]">{manifiesto.lines[0]}</p>
            <p className="text-accent-gold">{manifiesto.lines[1]}</p>
            <p className="text-accent-cyan">{manifiesto.lines[2]}</p>
          </div>
        </section>

        <div className="border-t border-[#2A2A3A]" />

        <section
          className={
            "space-y-3 transition-all duration-500 " +
            (visible.vision
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(240,237,232,0.6)]">
            Tu visión
          </p>
          <ul className="space-y-2 text-sm">
            {AREA_ORDER.map((area) => {
              const v = visionAreas.find((x) => x.area === area);
              if (!v) return null;
              return (
                <li key={area} className="text-[rgba(240,237,232,0.85)]">
                  <span className="font-semibold text-accent-cyan">
                    {AREA_LABELS[area].toUpperCase()}
                  </span>
                  <span className="text-[rgba(240,237,232,0.5)]"> · </span>
                  <span>{truncate(v.statement, 50)}</span>
                  <span className="text-[rgba(240,237,232,0.5)]"> · </span>
                  <span className="text-accent-gold">{v.horizon}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <div className="border-t border-[#2A2A3A]" />

        <section
          className={
            "space-y-3 transition-all duration-500 " +
            (visible.sprint
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-[rgba(240,237,232,0.6)]">
            Esta semana
          </p>
          <ul className="space-y-2 text-sm">
            {sprintCommitments.map((c) => (
              <li key={c.habitPriority} className="text-[rgba(240,237,232,0.9)]">
                <span className="font-semibold text-accent-gold">
                  {String(c.habitPriority).padStart(2, "0")}
                </span>
                <span className="text-[rgba(240,237,232,0.5)]"> · </span>
                <span>{c.habit}</span>
                <span className="text-[rgba(240,237,232,0.5)]"> · </span>
                <span>
                  {c.days.map((d) => DAY_SHORT[d]).join(" ")}
                </span>
                <span className="text-[rgba(240,237,232,0.5)]"> · </span>
                <span>{timeLabel(c.timeOfDay)}</span>
              </li>
            ))}
          </ul>
        </section>

        <div className="border-t border-[#2A2A3A]" />

        <div
          className={
            "flex flex-col items-center gap-3 transition-all duration-500 " +
            (visible.avatar
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <EidosAvatar tier={tier} className="h-[120px] w-[86px]" />
          <p className="text-center text-lg font-semibold text-accent-gold">
            {nivelLabel}
          </p>
        </div>

        <div className="border-t border-[#2A2A3A]" />

        <footer
          className={
            "space-y-4 pb-8 transition-all duration-500 " +
            (visible.cta
              ? "translate-y-0 opacity-100"
              : "translate-y-4 opacity-0")
          }
        >
          <p className="text-center text-sm italic text-[rgba(240,237,232,0.6)]">
            Has completado el arco fundacional de EIDOS.
          </p>
          <Link
            href="/modulo04"
            className="block w-full rounded-lg border border-accent-cyan bg-accent-cyan/10 py-3.5 text-center font-medium text-accent-cyan transition-colors duration-200 hover:bg-accent-cyan/20"
          >
            Comenzar Módulo 04 →
          </Link>
          <button
            type="button"
            onClick={() =>
              window.alert("La ruta /perfil aún no está disponible.")
            }
            className="w-full rounded-lg border border-[#2A2A3A] py-3.5 text-center text-sm text-[rgba(240,237,232,0.6)] transition-colors duration-200 hover:text-[#F0EDE8]"
          >
            Ver mi perfil completo
          </button>
        </footer>

        <SaveProfilePrompt
          visible={visible.savePrompt}
          onDismiss={() => setVisible((v) => ({ ...v, savePrompt: false }))}
        />
      </div>
    </main>
  );
}
