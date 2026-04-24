"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { AuthChangeEvent, Session } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/client";

/**
 * Página a la que llega el usuario cuando pulsa el link del correo de
 * "recuperar contraseña". Supabase hidrata la sesión automáticamente y
 * dispara el evento PASSWORD_RECOVERY en onAuthStateChange — a partir de
 * ese momento podemos llamar `updateUser({ password })` para fijar la nueva.
 *
 * Si el usuario llega aquí sin sesión válida (link caducado, o manualmente),
 * mostramos un mensaje con volver al forgot-password.
 */
export default function ResetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [recovery, setRecovery] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    // Escuchamos los eventos de auth: el link del correo dispara
    // PASSWORD_RECOVERY una vez la sesión queda hidratada.
    const { data } = supabase.auth.onAuthStateChange(
      (event: AuthChangeEvent, _session: Session | null) => {
        if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
          setRecovery(true);
        }
        setReady(true);
      },
    );

    // Por si el evento ya pasó antes de montar: chequeamos la sesión actual.
    supabase.auth
      .getSession()
      .then(({ data: sessionData }: { data: { session: Session | null } }) => {
        if (sessionData.session) setRecovery(true);
        setReady(true);
      });

    return () => {
      data.subscription.unsubscribe();
    };
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });
      if (updateError) {
        setError(updateError.message);
        return;
      }
      setDone(true);
      // Pequeño delay para que el usuario alcance a leer el estado "listo".
      setTimeout(() => {
        router.push("/modulo04");
      }, 1200);
    } catch (err) {
      console.error("[EIDOS] updateUser(password) threw:", err);
      setError("No pudimos guardar la contraseña. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "#0D0D14" }}
    >
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <p
            className="mb-3 text-xs tracking-[0.3em]"
            style={{ color: "#22D3EE" }}
          >
            EIDOS
          </p>
          <h1 className="text-2xl font-light" style={{ color: "#F0EDE8" }}>
            Nueva contraseña
          </h1>
        </div>

        {!ready ? (
          <p
            className="text-center text-sm"
            style={{ color: "rgba(240,237,232,0.55)" }}
          >
            Preparando…
          </p>
        ) : !recovery ? (
          <div
            className="rounded-xl border px-4 py-5 text-sm"
            style={{
              borderColor: "rgba(239,68,68,0.35)",
              backgroundColor: "rgba(239,68,68,0.08)",
              color: "#F0EDE8",
            }}
          >
            <p className="font-semibold" style={{ color: "#EF4444" }}>
              Link expirado o inválido
            </p>
            <p
              className="mt-2"
              style={{ color: "rgba(240,237,232,0.7)" }}
            >
              El link que usaste no es válido o ya caducó. Pide uno nuevo
              desde la pantalla de recuperar contraseña.
            </p>
            <Link
              href="/forgot-password"
              className="mt-4 block text-center text-xs underline"
              style={{ color: "rgba(240,237,232,0.55)" }}
            >
              Pedir un link nuevo →
            </Link>
          </div>
        ) : done ? (
          <div
            className="rounded-xl border px-4 py-5 text-center text-sm"
            style={{
              borderColor: "rgba(34,211,238,0.35)",
              backgroundColor: "rgba(34,211,238,0.08)",
              color: "#F0EDE8",
            }}
          >
            <p className="font-semibold" style={{ color: "#22D3EE" }}>
              ✓ Contraseña actualizada
            </p>
            <p
              className="mt-2"
              style={{ color: "rgba(240,237,232,0.7)" }}
            >
              Entrando a tu Campo Base…
            </p>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs"
                style={{ color: "rgba(240,237,232,0.6)" }}
              >
                Nueva contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Mínimo 6 caracteres"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "#1A1A26",
                  border: "1px solid #2A2A3A",
                  color: "#F0EDE8",
                }}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-xs"
                style={{ color: "rgba(240,237,232,0.6)" }}
              >
                Confirma la contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
                placeholder="Repite la misma"
                className="w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors"
                style={{
                  backgroundColor: "#1A1A26",
                  border: "1px solid #2A2A3A",
                  color: "#F0EDE8",
                }}
              />
            </div>

            {error ? (
              <p className="text-xs" style={{ color: "#EF4444" }}>
                {error}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={loading || password.length < 6 || password !== confirm}
              className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
            >
              {loading ? "Guardando…" : "Guardar contraseña →"}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
