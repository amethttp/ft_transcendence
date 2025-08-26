import type { Route } from "../Router/Route/Route";

export class TitleHelper {
  static addTitlePart(part: string, title: string = document.title): string {
    if (!title)
      return part;
    else if (part) {
      const _title = title;
      title = `${part} | ${_title}`;
    }
    return title;
  }

  static setTitleFromRouteTree(routeTree: Route[]) {
    let title = "";
    for (const route of routeTree) {
      if (route.title)
        title = this.addTitlePart(route.title, title);
    }
    document.title = title;
  }
}