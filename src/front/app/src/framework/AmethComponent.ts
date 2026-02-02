import EventEmitter from "./EventEmitter/EventEmitter";
import type { Router } from "./Router/Router";

export type AmethComponentEvents = {
  change: any;
};

export default abstract class AmethComponent<Events extends Record<string, any> = AmethComponentEvents> extends EventEmitter<Events> {
  protected router?: Router;
  outlet?: HTMLElement;
  template?: () => Promise<typeof import("*.html?raw")>;

  afterInit() {}
  refresh() {}

  async destroy() {
    super.destroy();
  }

  async init(selector: string, router?: Router) {
    this.router = router;
    if (selector && this.template) {
      this.outlet = document.getElementById(selector) || undefined;
      if (this.outlet) this.outlet.innerHTML = (await this.template()).default;
      (this.outlet?.querySelector('[autofocus]') as HTMLElement)?.focus();
    }
  }
}
