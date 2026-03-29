"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  OnboardingNavContext,
  type OnboardingNavHandlers,
} from "@/components/onboarding/onboarding-nav-context";
import { useOnboardingStore } from "@/store/onboardingStore";
import { Step1Impacto } from "@/components/onboarding/steps/Step1Impacto";
import { Step2Promesa } from "@/components/onboarding/steps/Step2Promesa";
import { Step3Auth } from "@/components/onboarding/steps/Step3Auth";
import { Step4Nombre } from "@/components/onboarding/steps/Step4Nombre";
import { Step5Bienvenida } from "@/components/onboarding/steps/Step5Bienvenida";
import { Step6Nivel } from "@/components/onboarding/steps/Step6Nivel";
import { Step7Disclaimer } from "@/components/onboarding/steps/Step7Disclaimer";
import { Step8Mision } from "@/components/onboarding/steps/Step8Mision";

const STEPS_WITH_SPACE_HINT = new Set([1, 2, 5]);

const STEPS = [
  Step1Impacto,
  Step2Promesa,
  Step3Auth,
  Step4Nombre,
  Step5Bienvenida,
  Step6Nivel,
  Step7Disclaimer,
  Step8Mision,
];

function isKeyboardBypassTarget(target: EventTarget | null) {
  if (!target || !(target instanceof HTMLElement)) return false;
  if (target.isContentEditable) return true;
  const tag = target.tagName;
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (tag === "BUTTON" || tag === "A") return true;
  return false;
}

export function OnboardingShell({ step }: { step: number }) {
  const router = useRouter();
  const handlersRef = useRef<OnboardingNavHandlers | null>(null);
  const setHandlers = useCallback((h: OnboardingNavHandlers | null) => {
    handlersRef.current = h;
  }, []);

  const setStoreStep = useOnboardingStore((s) => s.setStep);
  const nombre = useOnboardingStore((s) => s.nombre);

  useEffect(() => {
    setStoreStep(step);
  }, [step, setStoreStep]);

  useEffect(() => {
    if (step >= 5 && step <= 8 && !nombre.trim()) {
      router.replace("/onboarding/4");
    }
  }, [step, nombre, router]);

  const [prevStep, setPrevStep] = useState(step);
  let direction: "forward" | "back" = "forward";
  if (step !== prevStep) {
    direction = step > prevStep ? "forward" : "back";
    setPrevStep(step);
  }

  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);

  const runGoNext = useCallback(() => {
    const h = handlersRef.current;
    if (h?.canGoNext && !h.canGoNext()) return;
    if (h?.goNext) {
      h.goNext();
      return;
    }
    if (step >= 8) {
      router.push("/modulo01/capa1");
    } else {
      router.push(`/onboarding/${step + 1}`);
    }
  }, [step, router]);

  const runGoBack = useCallback(() => {
    const h = handlersRef.current;
    if (h?.canGoBack && !h.canGoBack()) return;
    if (h?.goBack) {
      h.goBack();
      return;
    }
    if (step > 1) {
      router.push(`/onboarding/${step - 1}`);
    }
  }, [step, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (isKeyboardBypassTarget(e.target)) return;
      if (e.key === "ArrowRight" || e.code === "Space") {
        e.preventDefault();
        runGoNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        runGoBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [runGoNext, runGoBack]);

  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 0) return;
    const t = e.touches[0];
    touchStartX.current = t.clientX;
    touchStartY.current = t.clientY;
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current == null || touchStartY.current == null) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartX.current;
    const dy = t.clientY - touchStartY.current;
    touchStartX.current = null;
    touchStartY.current = null;
    if (Math.abs(dx) < 60 || Math.abs(dy) > Math.abs(dx)) return;
    if (dx < 0) runGoNext();
    else runGoBack();
  };

  const StepComponent = STEPS[step - 1];
  if (!StepComponent) return null;

  const animationName =
    direction === "forward" ? "onboarding-in-forward" : "onboarding-in-back";

  return (
    <OnboardingNavContext.Provider value={{ setHandlers }}>
      <div
        className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-10 md:px-12 md:py-16"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div
          key={step}
          className="flex min-h-0 flex-1 flex-col ease-in-out"
          style={{
            animation: `${animationName} 400ms ease-in-out both`,
          }}
        >
          <StepComponent />
          {STEPS_WITH_SPACE_HINT.has(step) ? (
            <p className="mt-auto shrink-0 pt-16 text-center text-base">
              <span className="animate-pulse text-accent-cyan">· · ·</span>
              <span className="text-white/70"> espacio para continuar</span>
            </p>
          ) : null}
        </div>
      </div>
    </OnboardingNavContext.Provider>
  );
}
