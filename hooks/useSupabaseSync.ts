"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/client";
import {
  loadProfileFromSupabase,
  saveProfileToSupabase,
} from "@/lib/supabase/profile";
import { useOnboardingStore, type OnboardingStore } from "@/store/onboardingStore";

/**
 * Heurística: cuánto "peso" tienen los datos de onboarding.
 * Se usa para decidir quién gana cuando local y remoto difieren.
 * Contamos respuestas de capa1 no-null, áreas de capa2, visiones, hábitos,
 * flags de módulos. Más datos → más peso.
 */
function profileWeight(
  state: Partial<OnboardingStore> | null | undefined,
): number {
  if (!state) return 0;
  let w = 0;
  if (Array.isArray(state.capa1Saved)) {
    w += state.capa1Saved.filter((x) => x != null).length * 3;
  }
  if (Array.isArray(state.capa2Areas)) w += state.capa2Areas.length * 5;
  if (Array.isArray(state.visionAreas)) w += state.visionAreas.length * 2;
  if (Array.isArray(state.criticalHabits)) w += state.criticalHabits.length;
  if (Array.isArray(state.sprintCommitments)) {
    w += state.sprintCommitments.length * 2;
  }
  if (state.manifiesto) w += 3;
  if (state.rutinaBase) w += 3;
  if (state.modulo03Completed) w += 10;
  if (typeof state.nombre === "string" && state.nombre.length > 0) w += 1;
  return w;
}

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

            // Política "load-first, save-only-if-local-wins":
            // 1) LEE primero lo remoto.
            // 2) Comparamos peso (nº de respuestas significativas).
            // 3) Si remoto > local, hidratamos local con remoto (confiamos en lo
            //    guardado).
            // 4) Si local > remoto, subimos local (el usuario tiene cambios
            //    nuevos).
            // 5) Si empatan, no tocamos nada.
            // Esto previene el bug donde una pestaña nueva (sessionStorage
            // vacío) pisaba los datos buenos del usuario con defaults.
            loadProfileFromSupabase(uid)
              .then((remote) => {
                if (cancelled) return;
                const local = useOnboardingStore.getState();
                const remoteW = profileWeight(remote);
                const localW = profileWeight(local);

                if (remoteW > localW && remote) {
                  console.log(
                    "[EIDOS] hydrating local from remote (remote=%d, local=%d)",
                    remoteW,
                    localW,
                  );
                  useOnboardingStore.setState(remote);
                  return;
                }

                if (localW > remoteW) {
                  console.log(
                    "[EIDOS] saving local to remote (local=%d, remote=%d)",
                    localW,
                    remoteW,
                  );
                  saveProfileToSupabase(uid, useOnboardingStore.getState())
                    .catch((e) =>
                      console.error("[EIDOS] save onSignIn error:", e),
                    );
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
