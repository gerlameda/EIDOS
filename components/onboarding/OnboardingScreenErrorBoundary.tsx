"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = { children: ReactNode };

type State = { error: Error | null };

/**
 * Captura errores de runtime en pantallas de onboarding para mostrarlos
 * en móvil sin DevTools (texto blanco sobre rojo).
 */
export class OnboardingScreenErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("[OnboardingScreenErrorBoundary]", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      const { message, stack } = this.state.error;
      return (
        <div
          role="alert"
          className="min-h-[40vh] w-full max-w-2xl overflow-auto rounded-lg bg-red-600 p-5 text-left text-white shadow-lg"
        >
          <p className="text-xs font-semibold uppercase tracking-wide text-red-100">
            Error en esta pantalla
          </p>
          <p className="mt-3 break-words font-mono text-sm leading-snug text-white">
            {message || String(this.state.error)}
          </p>
          {stack ? (
            <pre className="mt-4 max-h-[50vh] overflow-auto whitespace-pre-wrap break-all text-xs leading-relaxed text-red-100">
              {stack}
            </pre>
          ) : null}
        </div>
      );
    }

    return this.props.children;
  }
}
