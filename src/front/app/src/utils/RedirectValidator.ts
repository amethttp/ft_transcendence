/**
 * Validates that a redirect URL is safe (same-origin, relative path)
 * Prevents open redirect vulnerabilities (CWE-601)
 * 
 * NOTE: The Router implementation is safe because it uses new URL(path, location.origin)
 * and only extracts the pathname, so even external URLs would be rendered harmless.
 * However, this validator provides defense-in-depth and clarifies intent.
 * 
 * @param redirectUrl - The URL to validate
 * @param defaultPath - Fallback path if validation fails (default: "/")
 * @returns Safe relative path or defaultPath
 */
export function validateRedirectUrl(redirectUrl: string | null | undefined, defaultPath: string = "/"): string {
  if (!redirectUrl || typeof redirectUrl !== "string") {
    return defaultPath;
  }

  const trimmed = redirectUrl.trim();

  if (trimmed === "") {
    return defaultPath;
  }

  if (/^[a-z][a-z0-9+.-]*:/i.test(trimmed)) {
    return defaultPath;
  }

  if (trimmed.startsWith("//")) {
    return defaultPath;
  }

  if (!trimmed.startsWith("/")) {
    return defaultPath;
  }

  if (trimmed.includes("\\")) {
    return defaultPath;
  }

  return trimmed;
}
