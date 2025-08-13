import type { Router } from "./Router/Router";

export abstract class AmethComponent {
  protected router?: Router;
  protected outlet?: HTMLElement;
  template?: () => Promise<typeof import("*.html?raw")>;

  afterInit() {}

  destroy() {}

  async init(selector: string, router?: Router) {
    this.router = router;
    if (selector && this.template) {
      this.outlet = document.getElementById(selector) || undefined;
      if (this.outlet) this.outlet.innerHTML = (await this.template()).default;
    }
    if (this.afterInit) this.afterInit();
  }
}
