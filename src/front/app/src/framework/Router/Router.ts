import type { AmethComponent } from "../AmethComponent";
import PathHelper from "./Path/helpers/PathHelper";
import PathMapper from "./Path/mappers/PathMapper";
import Path from "./Path/Path";
import type { Module, Route } from "./Route/Route";

export class Router {
  private _routes: Route[];
  private _selector: string;
  private _currentComponent: AmethComponent | null;
  private _currentPath: Path;

  constructor(selector: string, routes: Route[]) {
    this._selector = selector;
    this._routes = routes;
    this._currentComponent = null;
    this._currentPath = new Path();
    this.listen();
  }

  get currentPath(): Path {
    return this._currentPath;
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
    window.addEventListener("popstate", () => this.navigate(location.pathname));

    document.addEventListener("click", (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!anchor) return;

      if (!this.isOtherEvent(e, anchor)) {
        e.preventDefault();
        const href = anchor.href;
        const newUrl = new URL(href);
        if (newUrl.pathname && href != location.href) {
          this.navigateByUrl(newUrl);
        }
      }
    });

    this.navigate(location.pathname);
  }

  private async navigate(path: string) {
    if (this._currentComponent && this._currentComponent?.destroy)
      await this._currentComponent.destroy();

    const route = this._routes.find((r) => {
      return (
        (PathHelper.isPathMatching(r.path, path) && (!r.guard || r.guard(r))) ||
        r.path === "*"
      );
    });
    if (route) {
      if (route.redirect) return this.navigateByPath(route.redirect);
      this._currentPath = PathMapper.fromRoutePath(route, path);
      this._currentComponent = null;
      if (route.component) {
        let module: Module = await route.component();
        this._currentComponent = new module.default();
        this._currentComponent?.init(this._selector, this);
      }
    } else {
      document.getElementById(this._selector)!.innerHTML =
        '<p class="text-red-600">404 Not Found</p>';
      this._currentComponent = null;
      return;
    }
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
