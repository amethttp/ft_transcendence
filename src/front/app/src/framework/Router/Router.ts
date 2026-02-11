import AmethComponent from "../AmethComponent";
import EventEmitter from "../EventEmitter/EventEmitter";
import PathHelper from "./Path/helpers/PathHelper";
import PathMapper from "./Path/mappers/PathMapper";
import Path from "./Path/Path";
import type { Route } from "./Route/Route";

export type RouterEvents = {
  navigate: { routeTree: Route[], path: Path, router?: Router };
}

export class Router extends EventEmitter<RouterEvents> {
  private _selector: string;
  private _routes: Route[];
  private _currentTree: Route[];
  private _currentComponents: AmethComponent<any>[];
  private _currentPath: Path;
  private _currentResolution: Record<string, any> = {};
  private _protectFromUnload: boolean;
  private _protectUnloadMsg: string;
  private _navigationQueue: Promise<void> = Promise.resolve();
  private _isNavigating: boolean = false;

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
      newUrl.pathname = this.normalizeURL(newUrl.href, false);
      if (newUrl.href !== oldHref)
        this.navigateByUrl(newUrl);
    });
    this.navigate(this.normalizeURL(location.href));
  }

  /**
   * Phase 1: Pure Route Matching
   * Synchronously matches a path to a flat list of routes without executing guards.
   * Handles empty path ("") layouts that act as composition containers.
   */
  private matchRoutes(path: string, routes: Route[] = this._routes, parentPath = ""): Route[] | null {
    for (const route of routes) {
      let separator = '/';
      if (route.path === "")
        separator = '';
      const fullPath = PathHelper.normalize(parentPath + separator + route.path);
      const isParentMatch = !!route.children && PathHelper.isParentMatching(fullPath, path);
      const isExactMatch = PathHelper.isMatching(fullPath, path);

      if (isParentMatch) {
        // Recursively search children
        const childMatch = this.matchRoutes(path, route.children!, fullPath);
        if (childMatch) {
          return [route, ...childMatch];
        }
      }
      else if (isExactMatch) {
        return [route];
      }
    }
    return null;
  }

  /**
   * Phase 2: Sequential Guard/Resolver Execution
   * Executes guards parent-to-child, accumulating resolver data.
   * 
   * Guard return values:
   * - `true`: Allow navigation, continue.
   * - `object`: Allow navigation, merge data into context.
   * - `string`: Hard redirect, stop navigation.
   * - `false`: Cancel navigation, revert URL.
   */
  private async executeResolution(routeTree: Route[], targetPath: string): Promise<{ success: false; reason: 'redirect' | 'cancelled'; target?: string } | { success: true; contextData: Record<string, any> }> {
    const contextData: Record<string, any> = {};

    for (const route of routeTree) {
      if (route.resolver) {
        try {
          const result = await route.resolver(PathMapper.fromRouteTree(routeTree, targetPath), contextData);

          if (typeof result === 'string') {
            // Hard redirect
            return { success: false, reason: 'redirect', target: result };
          }

          if (result === false) {
            // Navigation cancelled
            return { success: false, reason: 'cancelled' };
          }

          if (typeof result === 'object' && result !== null) {
            // Merge resolver data
            Object.assign(contextData, result);
          }
          // true: continue to next guard
        } catch (error) {
          console.error(`Guard execution error for route ${route.path}:`, error);
          return { success: false, reason: 'cancelled' };
        }
      }
    }

    return { success: true, contextData };
  }

  private normalizeURL(href: string, replaceHistory = true): string {
    const url = new URL(href);
    url.pathname = PathHelper.normalize(url.pathname);
    if (url.pathname !== "/" && url.pathname.endsWith("/")) {
      url.pathname = PathHelper.removeTrailingSlash(url.pathname);
    }
    if (replaceHistory && url.pathname !== new URL(location.href).pathname) {
      history.replaceState(null, "", url.href);
    }
    return url.pathname;
  }

  private async navigate(path: string) {
    this._navigationQueue = this._navigationQueue.then(async () => {
      try {
        await this._performNavigation(path);
      } catch (error) {
        console.error("Navigation error:", error);
      }
    });
    await this._navigationQueue;
  }

  private async _performNavigation(path: string) {
    if (this._isNavigating) return;
    this._isNavigating = true;

    // Save previous URL state in case we need to revert
    const previousUrlState = location.href;

    try {
      /**
       * Phase 1: Pure Route Matching
       */
      const routeTree = this.matchRoutes(path);

      if (!routeTree) {
        console.warn(`No route found for path: ${path}`);
        this._isNavigating = false;
        return;
      }

      /**
       * Phase 2: Sequential Resolver Execution
       */
      const resolution = await this.executeResolution(routeTree, path);

      if (!resolution.success) {
        if (resolution.reason === 'redirect') {
          // Hard redirect - stop navigation and go to new path
          this._isNavigating = false;
          this.redirectByPath(resolution.target!);
          return;
        }
        // Cancelled - revert URL to previous state
        history.replaceState(null, "", previousUrlState);
        this._isNavigating = false;
        return;
      }

      // Navigation succeeded - store context data for component access
      this._currentResolution = resolution.contextData;

      this._currentPath = PathMapper.fromRouteTree(routeTree, path);
      this.emitSync("navigate", { routeTree: routeTree, path: this._currentPath, router: this });

      let lastI = 0;
      const oldComponents: AmethComponent<any>[] = [];
      this._currentComponents.forEach(comp => oldComponents.push(comp));

      for (const [i, route] of routeTree.entries()) {
        lastI = i;
        if (route.redirect) return this.redirectByPath(route.redirect);

        if (this._currentTree[i] !== route) {
          if (this._currentComponents && this._currentComponents[i])
            await this._currentComponents[i].destroy();

          if (route.component) {
            const Component = (await route.component()).default;
            const newComponent: AmethComponent<any> = new Component();
            let selector = this._selector;

            if (i > 0) {
              const outlet = this._currentComponents[i - 1].outlet?.getElementsByClassName("router-outlet")[0];
              if (!outlet)
                return console.warn("No <div class=\"router-outlet\"></div> on ", this._currentComponents[i - 1]);
              selector = "r-" + Date.now() + Math.random().toString(36).slice(2, 9);
              outlet.setAttribute("id", selector);
            }

            // Pass resolver data to component
            await newComponent.init(selector, this, this._currentResolution);
            this._currentComponents[i] = newComponent;
          }
        }
      }

      if (this._currentComponents.length > routeTree.length) {
        const componentsToDestroy = this._currentComponents.splice(routeTree.length);
        for (const component of componentsToDestroy) {
          await component.destroy();
        }
      }

      const afterInitPromises: Promise<void>[] = [];
      for (const [i, component] of this._currentComponents.entries()) {
        if (i <= lastI) {
          if (i >= oldComponents.length || component != oldComponents[i]) {
            afterInitPromises.push(
              (async () => {
                try {
                  await component.afterInit();
                } catch (error) {
                  console.error("Component afterInit error:", error);
                }
              })()
            );
          }
          else {
            component.refresh();
          }
        }
      }

      await Promise.all(afterInitPromises);
      this._currentTree = routeTree;
    } catch (error) {
      console.error("Navigation error:", error);
      // On unhandled error, revert URL
      history.replaceState(null, "", previousUrlState);
    } finally {
      this._isNavigating = false;
    }
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
