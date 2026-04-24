"use client";

import Link from "next/link";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) {
      setError("Escribe un correo válido.");
      setLoading(false);
      return;
    }

    try {
      const supabase = createClient();
      // Supabase manda un magic link al correo que, al abrirlo, redirige a
      // /reset-password con la sesión ya hidratada (Supabase dispara el
      // evento PASSWORD_RECOVERY vía onAuthStateChange).
      const redirectTo =
        typeof window !== "undefined"
          ? `${window.location.origin}/reset-password`
          : undefined;
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        trimmed,
        { redirectTo },
      );

      if (resetError) {
        setError(resetError.message);
        return;
      }
      setSent(true);
    } catch (err) {
      console.error("[EIDOS] resetPasswordForEmail threw:", err);
      setError("No pudimos enviar el correo. Intenta de nuevo.");
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
            Recuperar contraseña
          </h1>
          <p
            className="mt-2 text-sm"
            style={{ color: "rgba(240,237,232,0.6)" }}
          >
            Te mandamos un link a tu correo para que elijas una nueva.
          </p>
        </div>

        {sent ? (
          <div
            className="rounded-xl border px-4 py-5 text-sm"
            style={{
              borderColor: "rgba(34,211,238,0.35)",
              backgroundColor: "rgba(34,211,238,0.08)",
              color: "#F0EDE8",
            }}
          >
            <p className="font-semibold" style={{ color: "#22D3EE" }}>
              Correo enviado
            </p>
            <p
              className="mt-2"
              style={{ color: "rgba(240,237,232,0.7)" }}
            >
              Revisa tu bandeja de entrada (y spam) en{" "}
              <span className="font-mono text-[#F0EDE8]">{email}</span>. El
              link te va a traer de vuelta para establecer una nueva
              contraseña.
            </p>
            <Link
              href="/login"
              className="mt-4 block text-center text-xs underline"
              style={{ color: "rgba(240,237,232,0.55)" }}
            >
              ← Volver al login
            </Link>
          </div>
        ) : (
          <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
            <div>
              <label
                className="mb-2 block text-xs"
                style={{ color: "rgba(240,237,232,0.6)" }}
              >
                Tu correo
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="nombre@correo.com"
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
              disabled={loading || !email.trim()}
              className="w-full rounded-lg py-3 text-sm font-medium transition-opacity disabled:opacity-40"
              style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
            >
              {loading ? "Enviando…" : "Enviar link →"}
            </button>

            <div className="pt-2 text-center">
              <Link
                href="/login"
                className="text-xs underline"
                style={{ color: "rgba(240,237,232,0.55)" }}
              >
                ← Volver al login
              </Link>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
