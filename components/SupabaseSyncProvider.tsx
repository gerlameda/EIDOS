"use client";

import { useSupabaseSync } from "@/hooks/useSupabaseSync";

export function SupabaseSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useSupabaseSync();
  return <>{children}</>;
}
