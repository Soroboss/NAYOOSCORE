/** Valide une URL de redirection interne (évite open redirect). */
export function getSafeRedirectPath(
  path: string | null | undefined,
  fallback: string
): string {
  if (!path) return fallback;
  if (!path.startsWith("/") || path.startsWith("//")) return fallback;
  if (path.startsWith("/login") || path.startsWith("/register")) return fallback;
  return path;
}
