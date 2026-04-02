"use client";

import { useEffect } from "react";
import type { AuthChangeEvent, Session } from "@supabase/auth-js";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function AuthConfirmPage() {
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getSession().then(({ data }: { data: { session: Session | null } }) => {
      if (data.session) {
        router.replace("/modulo03/cierre");
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session: Session | null) => {
      if (event === "SIGNED_IN" && session) {
        router.replace("/modulo03/cierre");
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  return (
    <main
      style={{
        backgroundColor: "#0D0D14",
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <p
        style={{
          color: "#22D3EE",
          fontSize: "14px",
          letterSpacing: "0.2em",
        }}
      >
        Verificando...
      </p>
    </main>
  );
}
