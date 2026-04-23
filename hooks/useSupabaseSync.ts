"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/client";
import {
  loadProfileFromSupabase,
  saveProfileToSupabase,
} from "@/lib/supabase/profile";
import { useOnboardingStore } from "@/store/onboardingStore";

/**
 * Sincroniza el store de onboarding con Supabase cuando hay sesión activa.
 *
 * IMPORTANTE — anti-patrón a evitar:
 *   El callback de `supabase.auth.onAuthStateChange` NUNCA debe ser `async`
 *   ni contener `await` sobre otras llamadas del cliente de Supabase.
 *   Supabase-js v2 mantiene un lock interno mientras ejecuta estos callbacks;
 *   si dentro hacemos `.from(...).upsert(...)` o `auth.getUser()`, esas llamadas
 *   necesitan el mismo lock y el proceso se queda en deadlock para siempre.
 *
 *   Síntoma típico: `supabase.auth.signUp()` se "cuelga" sin resolver y sin
 *   emitir error — justo lo que veíamos en Step3Auth.
 *
 * Patrón correcto: el callback retorna de inmediato y difiere el trabajo con
 * `setTimeout(..., 0)` para que se ejecute fuera del lock.
 */
export function useSupabaseSync() {
  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let cancelled = false;

    function scheduleSave() {
      if (!userId) return;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (!userId || cancelled) return;
        console.log("[EIDOS] saving...");
        saveProfileToSupabase(userId, useOnboardingStore.getState())
          .then(() => console.log("[EIDOS] saved ok"))
          .catch((e) => console.error("[EIDOS] error:", e));
      }, 5000);
    }

    const unsubscribe = useOnboardingStore.subscribe(() => {
      scheduleSave();
    });

    // Carga inicial: al montar, si ya hay sesión activa hidratamos el store.
    // (Esto NO está dentro del callback de onAuthStateChange, así que es seguro
    // usar await aquí.)
    supabase.auth.getSession().then(
      async ({ data }: { data: { session: Session | null } }) => {
        if (cancelled) return;
        const { session } = data;
        if (!session?.user) return;
        userId = session.user.id;
        const profile = await loadProfileFromSupabase(session.user.id);
        if (profile && !cancelled) useOnboardingStore.setState(profile);
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      // OJO: callback síncrono a propósito. Si lo marcas `async` o metes `await`
      // en operaciones de Supabase adentro, vuelve el deadlock del signUp.
      (event: AuthChangeEvent, session: Session | null) => {
        if (event === "SIGNED_IN" && session?.user) {
          const uid = session.user.id;
          userId = uid;

          // Diferimos el trabajo de red fuera del lock de auth.
          setTimeout(() => {
            if (cancelled) return;

            // 1) Guarda inmediatamente el estado actual del onboarding.
            saveProfileToSupabase(uid, useOnboardingStore.getState())
              .catch((e) =>
                console.error("[EIDOS] save onSignIn error:", e),
              );

            // 2) Si había datos previos completados, los traemos.
            loadProfileFromSupabase(uid)
              .then((profile) => {
                if (cancelled) return;
                if (profile && profile.modulo03Completed) {
                  useOnboardingStore.setState(profile);
                }
              })
              .catch((e) =>
                console.error("[EIDOS] load onSignIn error:", e),
              );
          }, 0);
        }
        if (event === "SIGNED_OUT") userId = null;
      },
    );

    return () => {
      cancelled = true;
      unsubscribe();
      subscription.unsubscribe();
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, []);
}
