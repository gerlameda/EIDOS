import Modulo03CierreClient from "./Modulo03CierreClient";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function Modulo03CierrePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return <Modulo03CierreClient hasSession={user !== null} />;
}
