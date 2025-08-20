import type { Router } from "./Router/Router";

export default abstract class AmethComponent {
  protected router?: Router;
  outlet?: HTMLElement;
  template?: () => Promise<typeof import("*.html?raw")>;

  afterInit() {}
  refresh() {}

  async destroy() {}

  async init(selector: string, router?: Router) {
    this.router = router;
    if (selector && this.template) {
      this.outlet = document.getElementById(selector) || undefined;
      if (this.outlet) this.outlet.innerHTML = (await this.template()).default;
    }
    if (this.afterInit) this.afterInit();
  }
}
