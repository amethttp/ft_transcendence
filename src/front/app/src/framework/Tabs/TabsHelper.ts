export class TabsHelper {
  static checkTabs(container: HTMLElement, path: string = "") {
    const tabs = container.children;
    const url = new URL(path, location.origin);
    for (const tab of ([...tabs] as HTMLAnchorElement[])) {
      if (url.toString() == tab.href)
        tab.classList.add("active");
      else
        tab.classList.remove("active");
    }
  }
}