import { createBrowserClient } from "@supabase/ssr";

let client: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (client) return client;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anonKey) {
    // Error explícito en lugar de `undefined!` silencioso. Si esto se dispara
    // en el browser es que Vercel no está inyectando las NEXT_PUBLIC_* al
    // bundle del cliente (revisar Environment → Production/Preview).
    throw new Error(
      "[EIDOS] Faltan NEXT_PUBLIC_SUPABASE_URL o NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.",
    );
  }

  client = createBrowserClient(url, anonKey);
  return client;
}
