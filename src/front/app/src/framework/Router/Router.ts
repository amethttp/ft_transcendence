import AmethComponent from "../AmethComponent";
import EventEmitter from "../EventEmitter/EventEmitter";
import PathHelper from "./Path/helpers/PathHelper";
import PathMapper from "./Path/mappers/PathMapper";
import Path from "./Path/Path";
import type { Route } from "./Route/Route";

export type RouterEvents = {
  navigate: {path: Path, router?: Router};
}

export class Router {
  private _selector: string;
  private _routes: Route[];
  private _currentTree: Route[];
  private _currentComponents: AmethComponent[];
  private _currentPath: Path;
  private _emitter: EventEmitter<RouterEvents>;

  constructor(selector: string, routes: Route[]) {
    this._selector = selector;
    this._routes = routes;
    this._currentTree = [];
    this._currentComponents = [];
    this._currentPath = new Path();
    this._emitter = new EventEmitter();
    this.listen();
  }

  get currentPath(): Path {
    return this._currentPath;
  }

  get emitter(): EventEmitter<RouterEvents> {
    return this._emitter;
  }

  private isOtherEvent(e: MouseEvent, anchor: HTMLAnchorElement): boolean {
    return (
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      e.button !== 0 ||
      (anchor.target && anchor.target.toLowerCase() !== "_self") ||
      anchor.origin !== location.origin ||
      anchor.hasAttribute("download") ||
      !anchor.href.startsWith(location.origin) ||
      /^(mailto:|tel:|javascript:)/i.test(anchor.href) ||
      !!(
        anchor.dataset["linkType"] &&
        anchor.dataset["linkType"].includes("forceReload")
      )
    );
  }

  private listen() {
    window.addEventListener("popstate", () => this.navigate(this.normalizeURL(location.href)));
    document.addEventListener("click", (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!anchor || this.isOtherEvent(e, anchor)) return;
      e.preventDefault();
      const newUrl = new URL(anchor.href);
      const oldHref = location.href;
      newUrl.pathname = this.normalizeURL(newUrl.href);
      if (newUrl.href !== oldHref)
        this.navigateByUrl(newUrl);
    });
    this.navigate(this.normalizeURL(location.href));
  }

  private findRouteTree(path: string, routes: Route[] = this._routes, parentPath = ""): Route[] | undefined {
    for (const route of routes) {
      let separator = '/';
      if (route.path === "")
        separator = '';
      const fullPath = PathHelper.normalize(parentPath + separator + route.path);
      if (route.children && PathHelper.isParentMatching(fullPath, path) && (!route.guard || route.guard(route))) {
        const childTree = this.findRouteTree(path, route.children, fullPath);
        if (childTree) return [route, ...childTree];
        else continue;
      }
      else if (PathHelper.isMatching(fullPath, path) && (!route.guard || route.guard(route))) {
        return [route];
      }
    }
    return undefined;
  }

  private normalizeURL(href: string): string {
    const url = new URL(href);
    if (url.pathname.endsWith("/")) {
      url.pathname = PathHelper.removeTrailingSlash(url.pathname);
      history.replaceState(null, "", url.href);
    }
    return url.pathname;
  }

  private async navigate(path: string) {
    const routeTree = this.findRouteTree(path);
    if (!routeTree) {
      console.warn(`No route found for path: ${path}`);
      return;
    }

    this._currentPath = PathMapper.fromRouteTree(routeTree, path);
    for (const [i, route] of routeTree.entries()) {
      if (route.redirect) return this.navigateByPath(route.redirect);
      if (this._currentTree[i] !== route) {
        if (this._currentComponents && this._currentComponents[i])
          await this._currentComponents[i].destroy();
        if (route.component) {
          const Component = (await route.component()).default;
          const newComponent: AmethComponent = new Component();
          let selector = this._selector;
          if (i > 0) {
            const outlet = this._currentComponents[i - 1].outlet?.getElementsByClassName("router-outlet")[0];
            if (!outlet)
              return console.warn("No <div class=\"router-outlet\"></div> on ", this._currentComponents[i - 1]);
            selector = "r-" + Date.now() + Math.random().toString(36).slice(2, 9);
            outlet.setAttribute("id", selector);
          }
          await newComponent.init(selector, this);
          this._currentComponents[i] = newComponent;
        }
      }
      else {
        console.log("Reused component: ", this._currentComponents[i]);
        this._currentComponents[i].refresh();
      }
    }
    this._currentTree = routeTree;
    this._emitter.emit("navigate", {path: this._currentPath, router: this});
  }

  navigateByPath(path: string) {
    const newUrl = new URL(path, location.origin);
    this.navigateByUrl(newUrl);
  }

  navigateByUrl(newUrl: URL) {
    history.pushState(null, "", newUrl.href);
    this.navigate(newUrl.pathname);
  }
}
