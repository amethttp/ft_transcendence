import type { Route } from "../Router/Route/Route";

export class TitleHelper {
  private static _prevTitle: string = document.title;

  static setTitlePart(part: string, refresh: boolean = false) {
    if (!refresh)
      this._prevTitle = document.title;
    document.title = `${part} - ${this._prevTitle}`;
  }

  static refreshTitlePart(part: string) {
    this.setTitlePart(part, true);
  }

  static setTitleFromRouteTree(routeTree: Route[]) {
    const routesWithTitle = routeTree.filter(route => route.title != undefined);
    for (const route of routesWithTitle) {
      if (route === routesWithTitle[0])
        document.title = route.title!;
      else
        this.setTitlePart(route.title!);
    }
  }
}