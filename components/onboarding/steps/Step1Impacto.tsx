"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

export function Step1Impacto() {
  useEffect(() => {
    const initAnonSession = async () => {
      const supabase = createClient();
      const {
        data: { session },
      } = await supabase.auth.getSession();
      console.log(
        "[EIDOS] session al inicio:",
        session?.user?.id,
        "is_anonymous:",
        session?.user?.is_anonymous,
      );
      if (!session) {
        const { data, error } = await supabase.auth.signInAnonymously();
        console.log(
          "[EIDOS] signInAnonymously result:",
          data?.user?.id,
          "error:",
          error?.message,
        );
      }
    };
    void initAnonSession();
  }, []);

  return (
    <div className="flex min-h-full flex-1 flex-col items-center justify-center text-center">
      <div className="w-full max-w-xl space-y-6">
        <p className="text-2xl font-medium leading-snug text-text-primary md:text-3xl">
          El juego de tu vida ya empezó.
        </p>
        <p className="text-xl leading-relaxed text-text-primary/95 md:text-2xl">
          La pregunta es: ¿estás jugando… o solo mirando?
        </p>
      </div>
    </div>
  );
}
