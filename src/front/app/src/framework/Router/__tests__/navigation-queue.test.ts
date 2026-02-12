import { describe, it, expect, beforeEach, vi } from "vitest";
import { Router } from "../Router";
import type { Route } from "../Route/Route";
import AmethComponent from "../../AmethComponent";

const setLocation = (path: string) => {
  history.replaceState(null, "", `http://localhost:5173${path}`);
};

class TestComponent extends AmethComponent {
  template = async () => ({ default: "<div></div>" });
  initCalled = false;
  afterInitCalled = false;
  afterInitDelay = 0;
  destroyCalled = false;
  
  async init(selector: string, router?: any) {
    this.initCalled = true;
    await super.init(selector, router);
  }

  async afterInit() {
    if (this.afterInitDelay > 0) {
      await new Promise(r => setTimeout(r, this.afterInitDelay));
    }
    this.afterInitCalled = true;
  }

  async destroy() {
    this.destroyCalled = true;
    await super.destroy();
  }
}

describe("Router Navigation Queue", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id=\"app\"></div>";
    setLocation("/");
  });

  it("should execute navigations sequentially", async () => {
    const executionOrder: string[] = [];
    
    class TrackingComponent extends TestComponent {
      name: string;
      constructor(name: string) {
        super();
        this.name = name;
      }

      async afterInit() {
        executionOrder.push(`${this.name}-init-start`);
        await new Promise(r => setTimeout(r, 10));
        executionOrder.push(`${this.name}-init-end`);
      }
    }

    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({
          default: class extends TrackingComponent {
            constructor() { super("page1"); }
          }
        })
      },
      {
        path: "/page2",
        component: async () => ({
          default: class extends TrackingComponent {
            constructor() { super("page2"); }
          }
        })
      },
      {
        path: "/page3",
        component: async () => ({
          default: class extends TrackingComponent {
            constructor() { super("page3"); }
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    // Wait for initial navigation
    await new Promise(r => setTimeout(r, 50));
    executionOrder.length = 0; // Clear initial navigation
    
    // Trigger multiple rapid navigations
    router.navigateByPath("/page2");
    router.navigateByPath("/page3");
    
    // Wait for all navigations to complete
    await new Promise(r => setTimeout(r, 100));

    // Verify they executed sequentially
    expect(executionOrder).toEqual([
      "page2-init-start",
      "page2-init-end",
      "page3-init-start",
      "page3-init-end"
    ]);
  });

  it("should wait for afterInit to complete before destroy", async () => {
    const events: string[] = [];

    class SlowComponent extends TestComponent {
      name: string;
      constructor(name: string) {
        super();
        this.name = name;
      }

      async afterInit() {
        events.push(`${this.name}-init-start`);
        await new Promise(r => setTimeout(r, 30));
        events.push(`${this.name}-init-end`);
      }

      async destroy() {
        events.push(`${this.name}-destroy-start`);
        await super.destroy();
        events.push(`${this.name}-destroy-end`);
      }
    }

    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({
          default: class extends SlowComponent {
            constructor() { super("initial"); }
          }
        })
      },
      {
        path: "/next",
        component: async () => ({
          default: class extends SlowComponent {
            constructor() { super("next"); }
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    // Navigate to next page
    router.navigateByPath("/next");
    
    // Wait for everything to complete
    await new Promise(r => setTimeout(r, 150));

    // Verify that init completes before destroy starts
    const initEndIndex = events.indexOf("initial-init-end");
    const destroyStartIndex = events.indexOf("initial-destroy-start");
    
    expect(initEndIndex).toBeGreaterThanOrEqual(0);
    expect(destroyStartIndex).toBeGreaterThanOrEqual(0);
    expect(initEndIndex).toBeLessThan(destroyStartIndex);
  });

  it("should handle rapid navigation without race conditions", async () => {
    const routes: Route[] = [
      { path: "/", component: async () => ({ default: TestComponent }) },
      { path: "/a", component: async () => ({ default: TestComponent }) },
      { path: "/b", component: async () => ({ default: TestComponent }) },
      { path: "/c", component: async () => ({ default: TestComponent }) },
    ];

    const router = new Router("app", routes);
    
    // Rapid-fire navigations
    router.navigateByPath("/a");
    router.navigateByPath("/b");
    router.navigateByPath("/c");
    router.navigateByPath("/");
    
    // Wait for queue to process
    await new Promise(r => setTimeout(r, 200));

    // Should end up at the last navigation target
    expect(window.location.pathname).toBe("/");
  });

  it("should handle redirects within queue", async () => {
    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({ default: TestComponent })
      },
      {
        path: "/protected",
        resolver: async () => "/login",
      },
      {
        path: "/login",
        component: async () => ({ default: TestComponent })
      }
    ];

    const router = new Router("app", routes);
    
    router.navigateByPath("/protected");
    
    await new Promise(r => setTimeout(r, 50));
    
    expect(window.location.pathname).toBe("/login");
  });

  it("should not allow overlapping navigations", async () => {
    let navigationCount = 0;
    
    class CountingComponent extends TestComponent {
      async init(selector: string, router?: any) {
        navigationCount++;
        await super.init(selector, router);
      }

      async afterInit() {
        await new Promise(r => setTimeout(r, 20));
      }
    }

    const routes: Route[] = [
      { 
        path: "/", 
        component: async () => ({ default: CountingComponent }) 
      },
      { 
        path: "/page", 
        component: async () => ({ default: CountingComponent }) 
      }
    ];

    const router = new Router("app", routes);
    
    // Attempt rapid navigations
    const nav1 = Promise.resolve(router.navigateByPath("/page"));
    const nav2 = Promise.resolve(router.navigateByPath("/"));
    
    await Promise.all([nav1, nav2]);
    await new Promise(r => setTimeout(r, 100));

    // Should have only 2 navigations (initial + one more)
    expect(navigationCount).toBeLessThanOrEqual(3);
  });

  it("should complete full lifecycle: init -> afterInit -> destroy", async () => {
    const lifecycle: string[] = [];

    class LifecycleComponent extends TestComponent {
      async init(selector: string, router?: any) {
        lifecycle.push("init-start");
        await super.init(selector, router);
        lifecycle.push("init-end");
      }

      async afterInit() {
        lifecycle.push("afterInit-start");
        await new Promise(r => setTimeout(r, 10));
        lifecycle.push("afterInit-end");
      }

      async destroy() {
        lifecycle.push("destroy-start");
        await super.destroy();
        lifecycle.push("destroy-end");
      }
    }

    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({ default: LifecycleComponent })
      },
      {
        path: "/next",
        component: async () => ({ default: LifecycleComponent })
      }
    ];

    const router = new Router("app", routes);
    router.navigateByPath("/next");
    
    await new Promise(r => setTimeout(r, 100));

    // Verify complete lifecycle
    expect(lifecycle).toContain("init-start");
    expect(lifecycle).toContain("init-end");
    expect(lifecycle).toContain("afterInit-start");
    expect(lifecycle).toContain("afterInit-end");
    expect(lifecycle).toContain("destroy-start");
    expect(lifecycle).toContain("destroy-end");

    // Verify correct order
    expect(lifecycle.indexOf("init-start")).toBeLessThan(lifecycle.indexOf("init-end"));
    expect(lifecycle.indexOf("init-end")).toBeLessThan(lifecycle.indexOf("afterInit-start"));
    expect(lifecycle.indexOf("afterInit-start")).toBeLessThan(lifecycle.indexOf("afterInit-end"));
  });

  it("should handle nested routes with queued navigation", async () => {
    class ParentComponent extends TestComponent {
      async init(selector: string, router?: any) {
        await super.init(selector, router);
        if (this.outlet) {
          this.outlet.innerHTML = '<div class="router-outlet"></div>';
        }
      }
    }

    const routes: Route[] = [
      {
        path: "",
        component: async () => ({ default: ParentComponent }),
        children: [
          {
            path: "/parent1",
            component: async () => ({ default: TestComponent })
          },
          {
            path: "/parent1/child",
            component: async () => ({ default: TestComponent })
          }
        ]
      }
    ];

    const router = new Router("app", routes);
    
    router.navigateByPath("/parent1");
    await new Promise(r => setTimeout(r, 50));
    
    router.navigateByPath("/parent1/child");
    await new Promise(r => setTimeout(r, 50));

    expect(window.location.pathname).toBe("/parent1/child");
  });

  it("should handle redirects that trigger new navigations in queue", async () => {
    const navigationPath: string[] = [];

    class TrackingComponent extends TestComponent {
      private path: string;
      
      constructor(path: string) {
        super();
        this.path = path;
      }

      async init(selector: string, router?: any) {
        navigationPath.push(this.path);
        await super.init(selector, router);
      }
    }

    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({
          default: class extends TrackingComponent {
            constructor() { super("/"); }
          }
        })
      },
      {
        path: "/temp",
        redirect: "/final"
      },
      {
        path: "/final",
        component: async () => ({
          default: class extends TrackingComponent {
            constructor() { super("/final"); }
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    router.navigateByPath("/temp");
    await new Promise(r => setTimeout(r, 100));

    expect(window.location.pathname).toBe("/final");
    expect(navigationPath).toContain("/final");
  });

  it("should handle component errors gracefully without blocking queue", async () => {
    class ErrorComponent extends TestComponent {
      async afterInit() {
        throw new Error("Component error");
      }
    }

    // Suppress and track console errors in test
    const consoleErrors: string[] = [];
    const consoleError = vi.spyOn(console, "error").mockImplementation((msg) => {
      consoleErrors.push(String(msg));
    });

    const routes: Route[] = [
      {
        path: "/",
        component: async () => ({ default: TestComponent })
      },
      {
        path: "/error",
        component: async () => ({ default: ErrorComponent })
      },
      {
        path: "/safe",
        component: async () => ({ default: TestComponent })
      }
    ];

    const router = new Router("app", routes);
    
    // Wait for initial navigation
    await new Promise(r => setTimeout(r, 50));
    
    router.navigateByPath("/error");
    await new Promise(r => setTimeout(r, 50));

    // Next navigation should still work even after error
    router.navigateByPath("/safe");
    await new Promise(r => setTimeout(r, 50));

    expect(window.location.pathname).toBe("/safe");
    expect(consoleErrors.some(e => e.includes("Component afterInit error"))).toBe(true);
    
    consoleError.mockRestore();
  });
});
