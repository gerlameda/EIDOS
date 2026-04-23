import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const EMAIL_OTP_TYPES: readonly EmailOtpType[] = [
  "signup",
  "invite",
  "magiclink",
  "recovery",
  "email_change",
  "email",
];

function isEmailOtpType(value: string): value is EmailOtpType {
  return (EMAIL_OTP_TYPES as readonly string[]).includes(value);
}

function capa1SavedHasData(saved: unknown): boolean {
  if (!Array.isArray(saved)) return false;
  return saved.some((x) => x != null);
}

function manifiestoHasContent(m: unknown): boolean {
  if (m == null) return false;
  if (typeof m === "string") return m.trim().length > 0;
  if (typeof m === "object" && !Array.isArray(m)) {
    const o = m as Record<string, unknown>;
    const lines = o.lines;
    if (Array.isArray(lines)) {
      return lines.some(
        (x) => x != null && String(x).trim().length > 0,
      );
    }
    return Object.keys(o).length > 0;
  }
  return false;
}

function redirectPathFromProfile(profile: {
  modulo03_completed: boolean | null;
  manifiesto: unknown;
  capa1_saved: unknown;
  nombre: string | null;
}): string {
  if (profile.modulo03_completed === true) return "/modulo04";
  if (manifiestoHasContent(profile.manifiesto)) return "/modulo03/cierre";
  if (capa1SavedHasData(profile.capa1_saved)) return "/modulo02";
  const nombre = profile.nombre;
  if (typeof nombre === "string" && nombre.trim().length > 0) {
    return "/onboarding/5";
  }
  // Redirigir a step 4 (nombre) en vez de step 1 para evitar que
  // Step1Impacto destruya la sesión recién confirmada via magic link.
  // Steps 1-3 son el gancho pre-auth; el usuario ya los vio.
  return "/onboarding/4";
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const typeParam = searchParams.get("type");

  const supabase = await createServerSupabaseClient();

  let authed = false;
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) authed = true;
  }
  if (
    !authed &&
    tokenHash &&
    typeParam &&
    isEmailOtpType(typeParam)
  ) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: typeParam,
    });
    if (!error) authed = true;
  }

  if (!authed) {
    return NextResponse.redirect(
      `${origin}/onboarding/1?auth_error=expired`,
    );
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    return NextResponse.redirect(`${origin}/onboarding/4`);
  }

  const { data: profile, error: profileError } = await supabase
    .from("eidos_profiles")
    .select("modulo03_completed, manifiesto, capa1_saved, nombre")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    // Sin perfil aún (usuario recién creado antes de que el trigger corra)
    // mandamos al primer paso real del onboarding para no pisar Step1Impacto.
    return NextResponse.redirect(`${origin}/onboarding/4`);
  }

  const path = redirectPathFromProfile(
    profile as {
      modulo03_completed: boolean | null;
      manifiesto: unknown;
      capa1_saved: unknown;
      nombre: string | null;
    },
  );

  return NextResponse.redirect(`${origin}${path}`);
}
