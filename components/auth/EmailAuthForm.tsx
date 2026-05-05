"use client";

import { useState, type CSSProperties } from "react";
import { createClient } from "@/lib/supabase/client";
import { GoogleAuthButton } from "@/components/auth/GoogleAuthButton";
import { redirectAfterAuth } from "@/lib/auth/redirect-after-auth";

// ─── Estilos compartidos ─────────────────────────────────────────────────────

const inputStyle: CSSProperties = {
  backgroundColor: "#1A1A26",
  border: "1px solid #2A2A3A",
  color: "#F0EDE8",
};
const inputClass =
  "w-full rounded-lg px-4 py-3 text-sm outline-none transition-colors focus:ring-1 focus:ring-[#22D3EE]/40";
const labelClass = "mb-1.5 block text-xs";
const labelStyle: CSSProperties = { color: "rgba(240,237,232,0.6)" };

// ─── Errores en español ───────────────────────────────────────────────────────

function translateError(msg: string): string {
  if (msg.includes("already registered") || msg.includes("User already registered"))
    return "Este correo ya tiene cuenta. ¿Quieres iniciar sesión?";
  if (msg.includes("Invalid login credentials"))
    return "Correo o contraseña incorrectos.";
  if (msg.includes("Email not confirmed"))
    return "Debes confirmar tu correo antes de iniciar sesión.";
  if (msg.includes("Password should be at least"))
    return "La contraseña debe tener al menos 8 caracteres.";
  if (msg.includes("rate limit") || msg.includes("too many requests"))
    return "Demasiados intentos. Espera un momento e intenta de nuevo.";
  if (msg.includes("invalid email") || msg.includes("Unable to validate"))
    return "El formato del correo no es válido.";
  return msg;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface EmailAuthFormProps {
  /** Override del redirect post-auth. Por defecto: redirectAfterAuth(). */
  onSuccess?: () => void;
  /** Qué tab mostrar al montar. */
  initialMode?: "signup" | "login";
}

// ─── Componente ───────────────────────────────────────────────────────────────

export function EmailAuthForm({
  onSuccess,
  initialMode = "signup",
}: EmailAuthFormProps) {
  const [mode, setMode] = useState<"signup" | "login">(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const handleSuccess = onSuccess ?? (() => void redirectAfterAuth());

  function switchMode(next: "signup" | "login") {
    setMode(next);
    setError(null);
    setPassword("");
    setConfirm("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = email.trim();
    if (!trimmed) return;
    if (password.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (mode === "signup" && password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    try {
      if (mode === "signup") {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: trimmed,
          password,
          options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? window.location.origin}/auth/callback`,
          },
        });

        console.log("[EIDOS] signUp data:", data, "error:", signUpError);

        if (signUpError) {
          setError(translateError(signUpError.message));
          setLoading(false);
          return;
        }
        if (data.session) {
          handleSuccess();
          return;
        }
        setEmailSent(true);
        setLoading(false);
        return;
      }

      // login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: trimmed,
        password,
      });

      console.log("[EIDOS] signIn data:", data, "error:", signInError);

      if (signInError) {
        setError(translateError(signInError.message));
        setLoading(false);
        return;
      }
      if (data.session) {
        handleSuccess();
        return;
      }
      setError("No se pudo iniciar sesión. Intenta de nuevo.");
      setLoading(false);
    } catch (err) {
      console.error("[EIDOS] auth threw:", err);
      setError("Error inesperado. Intenta de nuevo.");
      setLoading(false);
    }
  }

  // ── Estado: email de confirmación enviado ──────────────────────────────────
  if (emailSent) {
    return (
      <div
        className="rounded-xl p-5 text-center"
        style={{ backgroundColor: "#1A1A26", border: "1px solid #2A2A3A" }}
      >
        <p className="text-sm font-semibold" style={{ color: "#22D3EE" }}>
          Revisa tu correo
        </p>
        <p className="mt-2 text-xs leading-relaxed" style={{ color: "rgba(240,237,232,0.6)" }}>
          Enviamos un enlace de activación a{" "}
          <strong style={{ color: "#F0EDE8" }}>{email}</strong>.
        </p>
        <button
          type="button"
          onClick={() => { setEmailSent(false); switchMode("login"); }}
          className="mt-4 text-xs underline underline-offset-2 transition-opacity hover:opacity-70"
          style={{ color: "rgba(240,237,232,0.5)" }}
        >
          Ya confirmé → Iniciar sesión
        </button>
      </div>
    );
  }

  const isSignup = mode === "signup";
  const passwordMismatch = isSignup && confirm.length > 0 && confirm !== password;
  const canSubmit =
    email.trim().length > 0 &&
    password.length >= 8 &&
    (!isSignup || (confirm.length >= 8 && !passwordMismatch)) &&
    !loading;

  // ── Formulario principal ───────────────────────────────────────────────────
  return (
    <div className="w-full">

      {/* ── Tabs centrados ── */}
      <div className="mb-7 flex justify-center">
        <div
          className="flex gap-1 rounded-full p-1"
          style={{ backgroundColor: "#1A1A26", border: "1px solid #2A2A3A" }}
        >
          {(["login", "signup"] as const).map((m) => {
            const active = mode === m;
            const label = m === "login" ? "Ingresar" : "Crear cuenta";
            return (
              <button
                key={m}
                type="button"
                onClick={() => switchMode(m)}
                className="rounded-full px-5 py-2 text-xs font-medium transition-all duration-200"
                style={
                  active
                    ? { backgroundColor: "#22D3EE", color: "#0D0D14" }
                    : { color: "rgba(240,237,232,0.45)" }
                }
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Formulario ── */}
      <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
        <div>
          <label className={labelClass} style={labelStyle}>
            Correo
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            placeholder="tu@correo.com"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        <div>
          <label className={labelClass} style={labelStyle}>
            Contraseña
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={8}
            autoComplete={isSignup ? "new-password" : "current-password"}
            placeholder="Mínimo 8 caracteres"
            className={inputClass}
            style={inputStyle}
          />
        </div>

        {isSignup && (
          <div
            style={{
              overflow: "hidden",
              maxHeight: isSignup ? "200px" : "0px",
              opacity: isSignup ? 1 : 0,
              transition: "max-height 0.2s ease, opacity 0.2s ease",
            }}
          >
            <label className={labelClass} style={labelStyle}>
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required={isSignup}
              minLength={8}
              autoComplete="new-password"
              placeholder="Repite la contraseña"
              className={inputClass}
              style={{
                ...inputStyle,
                borderColor: passwordMismatch ? "#EF4444" : "#2A2A3A",
              }}
            />
            {passwordMismatch && (
              <p className="mt-1 text-xs" style={{ color: "#EF4444" }}>
                Las contraseñas no coinciden.
              </p>
            )}
          </div>
        )}

        {error ? (
          <p className="text-xs" style={{ color: "#EF4444" }}>
            {error}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full rounded-lg py-3 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ backgroundColor: "#22D3EE", color: "#0D0D14" }}
        >
          {loading ? "Cargando…" : isSignup ? "Crear cuenta" : "Ingresar"}
        </button>
      </form>

      {/* ── Divisor ── */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1" style={{ backgroundColor: "#2A2A3A" }} />
        <span className="text-xs" style={{ color: "rgba(240,237,232,0.3)" }}>
          o
        </span>
        <div className="h-px flex-1" style={{ backgroundColor: "#2A2A3A" }} />
      </div>

      {/* ── Google ── */}
      <GoogleAuthButton label="Continuar con Google" />
    </div>
  );
}
