import { createClient } from "@/lib/supabase/client";

// Compatibilidad con imports existentes (`@/lib/supabase`).
export const supabase = createClient();