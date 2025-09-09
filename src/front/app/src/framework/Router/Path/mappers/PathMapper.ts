import type { Route } from "../../Route/Route";
import Path, { type PathParam } from "../Path";
import PathHelper from "../helpers/PathHelper";

export default class PathMapper {
  static fromRoutePath(route: Route, pathName: string): Path {
    const path: Path = new Path(pathName);
    const routeParts = PathHelper.getParts(route.path);
    const pathParts = PathHelper.getParts(pathName);

    routeParts.forEach((routePart, i) => {
      if (routePart.startsWith(":"))
        path.params[routePart.slice(1)] = pathParts[i];
    });

    return path;
  }

  static getParams(routeParts: string[], _pathParts: string[]): Record<string, PathParam> {
    const params: Record<string, PathParam> = {};
    const pathParts = _pathParts.filter(part => part !== "");
    for (const [index, routePart] of routeParts.filter(part => part !== "").entries()) {
      if (routePart.startsWith(":"))
        params[routePart.slice(1)] = pathParts[index];
    }
    return params;
  }

  static fromRouteTree(routeTree: Route[], fullPath: string): Path {
    const path = new Path(fullPath);
    const routeParts: string[] = [];
    const pathParts = PathHelper.getParts(fullPath);

    for (const route of routeTree) {
      path.routePath = route.path;
      routeParts.push(...PathHelper.getParts(route.path));
    }

    path.params = this.getParams(routeParts, pathParts);
    return path;
  }
}
