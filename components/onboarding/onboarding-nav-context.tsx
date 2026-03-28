"use client";

import { createContext, useContext } from "react";

export type OnboardingNavHandlers = {
  canGoNext?: () => boolean;
  goNext?: () => void;
  canGoBack?: () => boolean;
  goBack?: () => void;
};

export type OnboardingNavContextValue = {
  setHandlers: (handlers: OnboardingNavHandlers | null) => void;
};

export const OnboardingNavContext =
  createContext<OnboardingNavContextValue | null>(null);

export function useOnboardingNavRegistration() {
  const ctx = useContext(OnboardingNavContext);
  if (!ctx) {
    throw new Error(
      "useOnboardingNavRegistration must be used within OnboardingNavProvider",
    );
  }
  return ctx;
}
