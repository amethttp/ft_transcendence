import type { Route } from "../../Router";
import Path from "../Path";
import PathHelper from "../helpers/PathHelper";

export default class PathMapper {
  static fromRoutePath(route: Route, pathName: string): Path {
    const path: Path = new Path(pathName);
    const routeParts = PathHelper.getParts(route.path);
    const pathParts = PathHelper.getParts(pathName);

    routeParts.forEach((routePart, i) => {
      if (routePart.startsWith(':'))
        path.params.set(routePart.slice(1), pathParts[i]);
    });

    return path;
  }
}