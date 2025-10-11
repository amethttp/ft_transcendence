export class CookieHelper {

  static get(key: string, cookie: string): string | null {
    const cookies = cookie.split(";");
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(key + "=")) {
        const eqIndex = trimmed.indexOf("=");
        return trimmed.slice(eqIndex + 1) || null;
      }
    }
    return null;
  }
}
