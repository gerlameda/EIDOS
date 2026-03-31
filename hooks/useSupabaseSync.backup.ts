"use client";
import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import {
  loadProfileFromSupabase,
  saveProfileToSupabase,
} from "@/lib/supabase/profile";
import { useOnboardingStore } from "@/store/onboardingStore";

export function useSupabaseSync() {
  const store = useOnboardingStore();
  const userIdRef = useRef<string | null>(null);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isHydratedRef = useRef(false);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session?.user) return;
      userIdRef.current = session.user.id;
      const profile = await loadProfileFromSupabase(session.user.id);
      if (profile) {
        useOnboardingStore.setState(profile);
      }
      isHydratedRef.current = true;
      void saveProfileToSupabase(session.user.id, useOnboardingStore.getState());
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" && session?.user) {
        userIdRef.current = session.user.id;
        const profile = await loadProfileFromSupabase(session.user.id);
        if (profile) {
          useOnboardingStore.setState(profile);
        }
        isHydratedRef.current = true;
        void saveProfileToSupabase(session.user.id, useOnboardingStore.getState());
      }
      if (event === "SIGNED_OUT") {
        userIdRef.current = null;
        isHydratedRef.current = false;
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!isHydratedRef.current) return;
    if (!userIdRef.current) return;
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      if (!userIdRef.current) return;
      void saveProfileToSupabase(userIdRef.current, useOnboardingStore.getState());
    }, 1500);
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [store]);
}
