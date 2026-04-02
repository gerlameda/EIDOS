"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/auth-js";
import { createClient } from "@/lib/supabase/client";
import {
  loadProfileFromSupabase,
  saveProfileToSupabase,
} from "@/lib/supabase/profile";
import { useOnboardingStore } from "@/store/onboardingStore";
import type { OnboardingStore } from "@/store/onboardingStore";

export function useSupabaseSync() {
  useEffect(() => {
    const supabase = createClient();
    let userId: string | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;

    function scheduleSave() {
      if (!userId) return;
      if (saveTimer) clearTimeout(saveTimer);
      saveTimer = setTimeout(() => {
        if (!userId) return;
        console.log("[EIDOS] saving...");
        saveProfileToSupabase(userId, useOnboardingStore.getState())
          .then(() => console.log("[EIDOS] saved ok"))
          .catch((e) => console.error("[EIDOS] error:", e));
      }, 5000);
    }

    const unsubscribe = useOnboardingStore.subscribe(() => {
      scheduleSave();
    });

    supabase.auth.getSession().then(
      async ({ data }: { data: { session: Session | null } }) => {
        const { session } = data;
        if (!session?.user) return;
        userId = session.user.id;
        const profile = await loadProfileFromSupabase(session.user.id);
        if (profile) useOnboardingStore.setState(profile);
      },
    );

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      async (event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session?.user) {
        userId = session.user.id;

        // Restaurar estado temporal guardado antes de enviar el magic link.
        const pending = localStorage.getItem("eidos-pending-save");
        if (pending) {
          try {
            const pendingState = JSON.parse(pending) as Partial<OnboardingStore>;
            useOnboardingStore.setState(pendingState);
            localStorage.removeItem("eidos-pending-save");
          } catch (e) {
            console.error("[EIDOS] error parsing pending state:", e);
          }
        }

        // Guarda inmediatamente el estado completo del onboarding.
        await saveProfileToSupabase(
          session.user.id,
          useOnboardingStore.getState(),
        );

        // Luego carga por si había datos previos en Supabase.
        const profile = await loadProfileFromSupabase(session.user.id);
        if (profile && profile.modulo03Completed) {
          useOnboardingStore.setState(profile);
        }
      }
      if (event === "SIGNED_OUT") userId = null;
      },
    );

    return () => {
      unsubscribe();
      subscription.unsubscribe();
      if (saveTimer) clearTimeout(saveTimer);
    };
  }, []);
}
