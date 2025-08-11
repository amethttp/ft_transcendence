import type { AmethComponent } from "./AmethComponent.ts";

type Module = {
  default: any;
};

export type Route = {
  path: string;
  component?: () => Promise<Module>;
};

export class Router {
  private _routes: Route[];
  private _selector: string;
  private _outlet: HTMLDivElement;
  private _currentModule: AmethComponent | null;

  constructor(selector: string, routes: Route[]) {
    this._selector = selector;
    this._routes = routes;
    this._outlet = document.querySelector<HTMLDivElement>(
      "#" + this._selector,
    )!;
    this._currentModule = null;
  }

  listen() {
    window.addEventListener("popstate", () => this.navigate(location.pathname));

    document.addEventListener("click", (e) => {
      const anchor = (e.target as HTMLElement).closest<HTMLAnchorElement>("a");
      if (!anchor) return;

      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;

      // Only left click
      if (e.button !== 0) return;

      if (anchor.target && anchor.target.toLowerCase() !== "_self") return;

      if (anchor.origin !== location.origin) return;

      if (
        anchor.hasAttribute("download") ||
        !anchor.href.startsWith(location.origin)
      )
        return;
      if (/^(mailto:|tel:|javascript:)/i.test(anchor.href)) return;

      if (
        anchor.matches("a") &&
        !anchor.dataset["linkType"]?.includes("forceReload")
      ) {
        e.preventDefault();
        const href = anchor.href;
        const newUrl = new URL(href);
        if (newUrl.pathname && href != location.pathname) {
          history.pushState(null, "", href);
          this.navigate(newUrl.pathname);
        }
      }
    });

    this.navigate(location.pathname);
  }

  async navigate(path: string) {
    if (this._currentModule && this._currentModule?.destroy) {
      await this._currentModule.destroy();
    }

    const route = this._routes.find((r) => {
      return r.path === path;
    });
    if (!route) {
      this._outlet.innerHTML = '<p class="text-red-600">404 Not Found</p>';
      this._currentModule = null;
      return;
    }

    this._currentModule = null;
    if (route.component) {
      let module: Module = await route.component();
      this._currentModule = new module.default();
      this._currentModule?.init();
      if (this._currentModule?.template) {
        this._outlet.innerHTML = (await this._currentModule.template()).default;
        if (this._currentModule?.viewInit) this._currentModule.viewInit();
      }
    }
  }
}
