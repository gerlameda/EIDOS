/**
 * Normaliza el nombre que el usuario escribe.
 *   "jOE" / "JOE" → "Joe"
 * Vive en `lib/` (no `store/`) a propósito: es una función pura sin
 * dependencias de Zustand / React, por lo que puede importarse desde
 * Server Actions (`"use server"`) sin arrastrar el bundle de cliente.
 */
export function normalizeNombreUsuario(raw: string): string {
  const t = raw.trim();
  if (!t) return "";
  return t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
}
