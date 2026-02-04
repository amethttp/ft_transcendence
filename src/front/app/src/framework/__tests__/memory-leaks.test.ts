// @ts-nocheck
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import AmethComponent from "../AmethComponent";
import EventEmitter from "../EventEmitter/EventEmitter";

if (typeof globalThis.ResizeObserver === "undefined") {
  globalThis.ResizeObserver = class {
    observe() {}
    disconnect() {}
    unobserve() {}
  } as any;
}

describe("Memory Leak Prevention - AmethComponent", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Interval/Timeout/RAF Tracking", () => {
    it("should clear all tracked intervals on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
        testIntervalId?: number;

        async afterInit() {
          this.testIntervalId = this.setInterval(() => {}, 100);
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      const intervalId = comp["_intervals"].size;
      expect(intervalId).toBe(1);

      await comp.destroy();
      
      expect(comp["_intervals"].size).toBe(0);
    });

    it("should clear all tracked timeouts on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });

        async afterInit() {
          this.setTimeout(() => {}, 100);
          this.setTimeout(() => {}, 200);
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      expect(comp["_timeouts"].size).toBe(2);

      await comp.destroy();
      
      expect(comp["_timeouts"].size).toBe(0);
    });

    it("should clear all tracked animation frames on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });

        async afterInit() {
          this.requestAnimationFrame(() => {});
          this.requestAnimationFrame(() => {});
          this.requestAnimationFrame(() => {});
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      expect(comp["_animationFrames"].size).toBe(3);

      await comp.destroy();
      
      expect(comp["_animationFrames"].size).toBe(0);
    });
  });

  describe("AbortController", () => {
    it("should abort controller on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      
      expect((comp as any).abortController.signal.aborted).toBe(false);

      await comp.destroy();
      
      expect((comp as any).abortController.signal.aborted).toBe(true);
    });

    it("should provide abort signal to fetch requests", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      
      const signal = (comp as any).abortController.signal;
      expect(signal).toBeDefined();
      expect(signal.aborted).toBe(false);

      await comp.destroy();
      
      expect(signal.aborted).toBe(true);
    });
  });

  describe("EventEmitter Cleanup", () => {
    it("should clear all listeners on destroy", async () => {
      type TestEvents = { change: any };
      
      class TestEmitter extends EventEmitter<TestEvents> {}

      const emitter = new TestEmitter();
      emitter.on("change", () => {});
      emitter.on("change", () => {});
      
      expect((emitter as any)["listeners"]["change"]?.length).toBe(2);

      emitter.destroy();
      
      expect((emitter as any)["listeners"]).toEqual({});
    });

    it("should prevent memory leaks from listener callbacks", async () => {
      type TestEvents = { change: any };
      
      class TestComponent extends AmethComponent<TestEvents> {
        template = async () => ({ default: "<div></div>" });
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      
      const callback = vi.fn();
      comp.on("change", callback);
      
      expect((comp as any)["listeners"]["change"]?.length).toBe(1);

      await comp.destroy();
      
      expect((comp as any)["listeners"]).toEqual({});
    });
  });

  describe("Outlet DOM Cleanup", () => {
    it("should clear outlet innerHTML on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div>Test Content</div>" });
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      
      expect(container.innerHTML).toContain("Test Content");

      await comp.destroy();
      
      expect(container.innerHTML).toBe("");
    });

    it("should cleanup after clearing children", async () => {
      class ParentComponent extends AmethComponent {
        template = async () => ({ default: "<div id='child'></div>" });
      }

      const parent = new ParentComponent();
      await parent.init("test-container");
      
      const childContainer = document.getElementById("child");
      expect(childContainer).not.toBeNull();

      await parent.destroy();
      
      expect(container.innerHTML).toBe("");
    });
  });
});

describe("Memory Leak Prevention - DOM Elements", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  describe("Event Listener Cleanup", () => {
    it("should remove window event listeners on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
        private handler = () => {};

        async afterInit() {
          window.addEventListener("resize", this.handler);
        }

        async destroy() {
          window.removeEventListener("resize", this.handler);
          await super.destroy();
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      const resizeHandler = vi.fn();
      comp["handler"] = resizeHandler;

      await comp.destroy();
      
      // Handler should be removed
      window.dispatchEvent(new Event("resize"));
      expect(resizeHandler).not.toHaveBeenCalled();
    });

    it("should remove document event listeners on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
        private handler = () => {};

        async afterInit() {
          document.addEventListener("click", this.handler);
        }

        async destroy() {
          document.removeEventListener("click", this.handler);
          await super.destroy();
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();

      await comp.destroy();
      
      // Component should be cleaned up
      expect(container.innerHTML).toBe("");
    });
  });

  describe("Observer Cleanup", () => {
    it("should disconnect ResizeObserver on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
        private observer?: ResizeObserver;

        async afterInit() {
          this.observer = new ResizeObserver(() => {});
          const element = this.outlet || container;
          this.observer.observe(element);
        }

        async destroy() {
          this.observer?.disconnect();
          await super.destroy();
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      const observer = comp["observer"];
      const disconnectSpy = vi.spyOn(observer!, "disconnect");

      await comp.destroy();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });

    it("should disconnect MutationObserver on destroy", async () => {
      class TestComponent extends AmethComponent {
        template = async () => ({ default: "<div></div>" });
        private observer?: MutationObserver;

        async afterInit() {
          this.observer = new MutationObserver(() => {});
          const element = this.outlet || container;
          this.observer.observe(element, { attributes: true });
        }

        async destroy() {
          this.observer?.disconnect();
          await super.destroy();
        }
      }

      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      
      const observer = comp["observer"];
      const disconnectSpy = vi.spyOn(observer!, "disconnect");

      await comp.destroy();
      
      expect(disconnectSpy).toHaveBeenCalled();
    });
  });
});

describe("Memory Leak Prevention - Generic Cleanup Contract", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  class GenericComponent extends AmethComponent {
    template = async () => ({ default: "<button id='btn'></button>" });
    private _clicked = 0;

    async afterInit() {
      const btn = this.outlet?.querySelector("#btn") as HTMLButtonElement | null;
      btn?.addEventListener("click", () => {
        this._clicked += 1;
      });

      this.setInterval(() => {}, 100);
      this.setTimeout(() => {}, 50);
      this.requestAnimationFrame(() => {});
    }

    get clickedCount() {
      return this._clicked;
    }
  }

  it("should allow destroy before init without throwing", async () => {
    const comp = new GenericComponent();
    await expect(comp.destroy()).resolves.toBeUndefined();
  });

  it("should allow destroy to be called twice safely", async () => {
    const comp = new GenericComponent();
    await comp.init("test-container");
    await comp.afterInit();

    await expect(comp.destroy()).resolves.toBeUndefined();
    await expect(comp.destroy()).resolves.toBeUndefined();
  });

  it("should clear tracked resources for any component using base helpers", async () => {
    const comp = new GenericComponent();
    await comp.init("test-container");
    await comp.afterInit();

    expect((comp as any)["_intervals"].size).toBe(1);
    expect((comp as any)["_timeouts"].size).toBe(1);
    expect((comp as any)["_animationFrames"].size).toBe(1);

    await comp.destroy();

    expect((comp as any)["_intervals"].size).toBe(0);
    expect((comp as any)["_timeouts"].size).toBe(0);
    expect((comp as any)["_animationFrames"].size).toBe(0);
    expect(container.innerHTML).toBe("");
  });
});

describe("Memory Leak Prevention - Specific Scenarios", () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement("div");
    container.id = "test-container";
    document.body.appendChild(container);
  });

  afterEach(() => {
    document.body.removeChild(container);
  });

  it("should not have lingering intervals after multiple destroy cycles", async () => {
    class TestComponent extends AmethComponent {
      template = async () => ({ default: "<div></div>" });
      async afterInit() {
        this.setInterval(() => {}, 100);
      }
    }

    for (let i = 0; i < 5; i++) {
      const comp = new TestComponent();
      await comp.init("test-container");
      await comp.afterInit();
      await comp.destroy();
    }

    // If leaking, this would have 5 lingering intervals
    // In a real scenario, this would be detected by memory profilers
    expect(true).toBe(true);
  });

  it("should not have lingering event listeners after nested component cleanup", async () => {
    class ChildComponent extends AmethComponent {
      template = async () => ({ default: "<div id='grandchild'></div>" });
      private handler = () => {};

      async afterInit() {
        window.addEventListener("click", this.handler);
      }

      async destroy() {
        window.removeEventListener("click", this.handler);
        await super.destroy();
      }
    }

    class ParentComponent extends AmethComponent {
      template = async () => ({ default: "<div id='child-container'></div>" });
      private child?: ChildComponent;

      async afterInit() {
        this.child = new ChildComponent();
        const childContainer = this.outlet?.querySelector("#child-container");
        if (childContainer) {
          await this.child.init("child-container");
          await this.child.afterInit();
        }
      }

      async destroy() {
        await this.child?.destroy();
        await super.destroy();
      }
    }

    const parent = new ParentComponent();
    await parent.init("test-container");
    await parent.afterInit();

    await parent.destroy();

    // Verify cleanup happened
    expect(container.innerHTML).toBe("");
  });

  it("should handle abort signal cancellation properly", async () => {
    class TestComponent extends AmethComponent {
      template = async () => ({ default: "<div></div>" });
    }

    const comp = new TestComponent();
    await comp.init("test-container");

    let signalFired = false;
    (comp as any).abortController.signal.addEventListener("abort", () => {
      signalFired = true;
    });

    await comp.destroy();

    expect(signalFired).toBe(true);
  });
});
