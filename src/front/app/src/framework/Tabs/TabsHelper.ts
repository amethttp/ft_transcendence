export class TabsHelper {
  static checkTabs(container: HTMLElement, path: string = "") {
    const tabs = container.children;
    const url = new URL(path, location.origin);
    const currentPath = url.pathname === "/" ? "/" : url.pathname.replace(/\/+$/, "");
    for (const tab of ([...tabs] as HTMLAnchorElement[])) {
      const tabUrl = new URL(tab.href, location.origin);
      const tabPath = tabUrl.pathname === "/" ? "/" : tabUrl.pathname.replace(/\/+$/, "");

      if (currentPath == tabPath)
        tab.classList.add("active");
      else
        tab.classList.remove("active");
    }
  }
}