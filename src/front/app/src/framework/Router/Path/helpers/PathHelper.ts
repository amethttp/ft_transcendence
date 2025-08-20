export default class PathHelper {
  static removeTrailingSlash(url: string): string {
    return url.replace(/\/+$/, "") || "/";
  }

  static normalize(path: string): string {
    return path.replace(/\/+/g, "/");
  }

  static getParts(path: string): string[] {
    return this.normalize(path).trimEnd().split("/");
  }


  static isParentMatching(pathA: string, pathB: string): boolean {
    if (pathA.includes("*") || pathB.startsWith(pathA)) return true;

    const routeParts = this.getParts(pathA);
    const pathParts = this.getParts(pathB);

    return routeParts.every((routeSegment, i) => {
      if (routeSegment.startsWith(":")) return true;
      return routeSegment === pathParts[i];
    });
  }

  static isMatching(pathA: string, pathB: string): boolean {
    if (pathA.includes("*")) return true;
    const routeParts = this.getParts(pathA);
    const pathParts = this.getParts(pathB);

    if (routeParts.length !== pathParts.length) return false;

    return routeParts.every((routeSegment, i) => {
      if (routeSegment.startsWith(":")) return true;
      return routeSegment === pathParts[i];
    });
  }

  static sanitizePath(path: string): string {
    if (path === "*") path = "";
    return path.trim();
  }
}
