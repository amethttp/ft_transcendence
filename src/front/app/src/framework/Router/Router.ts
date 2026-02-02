import AmethComponent from "../AmethComponent";
import EventEmitter from "../EventEmitter/EventEmitter";
import PathHelper from "./Path/helpers/PathHelper";
import PathMapper from "./Path/mappers/PathMapper";
import Path from "./Path/Path";
import type { Route } from "./Route/Route";

export type RouterEvents = {
  navigate: {routeTree: Route[], path: Path, router?: Router};
}

export class Router extends EventEmitter<RouterEvents> {
  private _selector: string;
  private _routes: Route[];
  private _currentTree: Route[];
  private _currentComponents: AmethComponent[];
  private _currentPath: Path;
  private _protectFromUnload: boolean;
  private _protectUnloadMsg: string;

  constructor(selector: string, routes: Route[]) {
    super();
    this._selector = selector;
    this._routes = routes;
    this._currentTree = [];
    this._currentComponents = [];
    this._currentPath = new Path();
    this.listen();
    this._protectFromUnload = false;
    this._protectUnloadMsg = "You have unsaved changes. Are you sure you want to leave?";
  }

  get currentPath(): Path {
    return this._currentPath;
  }

  preventUnload(msg?: string) {
    this._protectFromUnload = true;
    if (msg) {
      this._protectUnloadMsg = msg;
    }
  }

  permitUnload() {
    this._protectFromUnload = false;
    this._protectUnloadMsg = "You have unsaved changes. Are you sure you want to leave?";
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
    window.addEventListener("popstate", () => {
      if (this._protectFromUnload && !window.confirm(this._protectUnloadMsg)) {
        history.pushState(null, "", this.currentPath.fullPath || "/");
        return;
      }
      this.navigate(this.normalizeURL(location.href));
    });

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

  private async findRouteTree(path: string, routes: Route[] = this._routes, parentPath = ""): Promise<Route[] | undefined> {
    for (const route of routes) {
      let separator = '/';
      if (route.path === "")
        separator = '';
      const fullPath = PathHelper.normalize(parentPath + separator + route.path);
      if (route.children && PathHelper.isParentMatching(fullPath, path) && (!route.guard || await route.guard(route, this))) {
        const childTree = await this.findRouteTree(path, route.children, fullPath);
        if (childTree) return [route, ...childTree];
        else continue;
      }
      else if (PathHelper.isMatching(fullPath, path) && (!route.guard || await route.guard(route, this))) {
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
    const routeTree = await this.findRouteTree(path);
    if (!routeTree) {
      console.warn(`No route found for path: ${path}`);
      return;
    }

    this._currentPath = PathMapper.fromRouteTree(routeTree, path);
    this.emitSync("navigate", {routeTree: routeTree, path: this._currentPath, router: this});

    let lastI = 0;
    const oldComponents: AmethComponent[] = [];
    this._currentComponents.forEach(comp => oldComponents.push(comp));
    for (const [i, route] of routeTree.entries()) {
      lastI = i;
      if (route.redirect) return this.redirectByPath(route.redirect);
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
        // this._currentComponents[i].refresh();
      }
    }
    for (const [i, component] of this._currentComponents.entries()) {
      if (i <= lastI){
        if (i >= oldComponents.length || component != oldComponents[i])
          component.afterInit();
        else
          component.refresh();
      }
    }
    this._currentTree = routeTree;
  }

  navigateByPath(path: string) {
    const newUrl = new URL(path, location.origin);
    this.navigateByUrl(newUrl);
  }

  redirectByPath(path: string) {
    const newUrl = new URL(path, location.origin);
    history.replaceState(null, "", newUrl.href);
    this.navigate(newUrl.pathname);
  }

  navigateByUrl(newUrl: URL) {
    if (this._protectFromUnload && !window.confirm(this._protectUnloadMsg))
      return;
    history.pushState(null, "", newUrl.href);
    this.navigate(newUrl.pathname);
  }

  refresh() {
    this.navigate(this.currentPath.fullPath);
  }
}
