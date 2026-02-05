import EventEmitter from "./EventEmitter/EventEmitter";
import type { Router } from "./Router/Router";

export type AmethComponentEvents = {
  change: any;
};

export default abstract class AmethComponent<Events extends Record<string, any> = AmethComponentEvents> extends EventEmitter<Events> {
  protected router?: Router;
  outlet?: HTMLElement;
  template?: () => Promise<typeof import("*.html?raw")>;
  protected abortController: AbortController;
  private _intervals: Set<number> = new Set();
  private _timeouts: Set<number> = new Set();
  private _animationFrames: Set<number> = new Set();

  constructor() {
    super();
    this.abortController = new AbortController();
  }

  protected setInterval(handler: TimerHandler, timeout?: number): number {
    const id = setInterval(handler, timeout);
    this._intervals.add(id);
    return id;
  }

  protected setTimeout(handler: TimerHandler, timeout?: number): number {
    const id = setTimeout(handler, timeout);
    this._timeouts.add(id);
    return id;
  }

  protected requestAnimationFrame(callback: FrameRequestCallback): number {
    const id = requestAnimationFrame(callback);
    this._animationFrames.add(id);
    return id;
  }

  protected clearInterval(id: number | undefined): void {
    if (id !== undefined) {
      clearInterval(id);
      this._intervals.delete(id);
    }
  }

  protected clearTimeout(id: number | undefined): void {
    if (id !== undefined) {
      clearTimeout(id);
      this._timeouts.delete(id);
    }
  }

  protected cancelAnimationFrame(id: number): void {
    cancelAnimationFrame(id);
    this._animationFrames.delete(id);
  }

  afterInit() {}
  refresh() {}

  async destroy() {
    this.abortController.abort();
    
    this._intervals.forEach(id => clearInterval(id));
    this._intervals.clear();
    
    this._timeouts.forEach(id => clearTimeout(id));
    this._timeouts.clear();
    
    this._animationFrames.forEach(id => cancelAnimationFrame(id));
    this._animationFrames.clear();
    
    super.destroy();
    
    if (this.outlet) {
      this.outlet.innerHTML = '';
    }
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
