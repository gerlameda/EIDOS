/**
 * Sanitiza texto libre que recibimos del usuario antes de persistirlo.
 *
 * - Convierte cualquier valor no-string a string vacío (defensivo).
 * - Elimina TODOS los tags HTML/XML (<...>) — no permitimos markup en nombre,
 *   journal, hábitos ni notas. Si en el futuro queremos rich text, hay que
 *   cambiar de regla a una whitelist (DOMPurify) y NO seguir usando esto.
 * - Hace trim al final.
 * - Limita el resultado a 2000 caracteres.
 *
 * Pensado para texto plano corto/medio (nombres, respuestas de journal,
 * notas, etiquetas). Para campos con su propio normalizador (ej.
 * normalizeNombreUsuario) corre antes de ese normalizador, ya que las
 * mayúsculas/espacios deben gestionarse después de quitar el markup.
 */
export function sanitizeUserInput(input: string): string {
  if (typeof input !== "string") return "";

  // Strip HTML tags — incluye comentarios, CDATA y cualquier <tag attr=...>
  const stripped = input.replace(/<[^>]*>/g, "");

  // Trim
  const trimmed = stripped.trim();

  // Cap a 2000 chars
  if (trimmed.length > 2000) return trimmed.slice(0, 2000);
  return trimmed;
}

/**
 * Variante para campos opcionales: si el resultado queda vacío, devuelve null.
 * Útil para journal.content, journal.oneWord, journal.intentionTomorrow,
 * agenda.notes, etc.
 */
export function sanitizeOptionalUserInput(
  input: string | null | undefined,
): string | null {
  if (input == null) return null;
  const cleaned = sanitizeUserInput(input);
  return cleaned.length === 0 ? null : cleaned;
}
