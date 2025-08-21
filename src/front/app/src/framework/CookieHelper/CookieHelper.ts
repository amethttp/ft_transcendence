export class CookieHelper {

  static get(key: string): string | null {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const trimmed = cookie.trim();
      if (trimmed.startsWith(key + "=")) {
        const eqIndex = trimmed.indexOf("=");
        return trimmed.slice(eqIndex + 1) || null;
      }
    }
    return null;
  }

  static set(key: string, value: string, options: { path?: string; expires?: number } = {}) {
    let cookieStr = `${key}=${value}`;
    if (options.path)
      cookieStr += `; path=${options.path}`;
    if (options.expires)
      cookieStr += `; max-age=${options.expires}`;
    document.cookie = cookieStr;
  }

  static delete(key: string, path = "/") {
    document.cookie = `${key}=; path=${path}; max-age=0`;
  }
}
