export default class PathHelper {
  static normalize(path: string): string {
    if (path.endsWith('/') && path !== '/')
      return path.slice(0, -1);
    else
      return path;
  }

  static getParts(path: string): string[] {
    return this.normalize(path).split("/");
  }

  static isPathMatching(pathA: string, pathB: string): boolean {

    const routeParts = this.getParts(pathA);
    const pathParts = this.getParts(pathB);

    if (routeParts.length !== pathParts.length)
      return false;

    return routeParts.every((routeSegment, i) => {
      if (routeSegment.startsWith(':')) {
        return true;
      }
      return routeSegment === pathParts[i];
    });
  }
}