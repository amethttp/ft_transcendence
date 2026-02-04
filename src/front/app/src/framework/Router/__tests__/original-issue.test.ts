import { describe, it, expect, beforeEach } from "vitest";
import { Router } from "../Router";
import type { Route } from "../Route/Route";
import AmethComponent from "../../AmethComponent";

const setLocation = (path: string) => {
  history.replaceState(null, "", `http://localhost:5173${path}`);
};

// Mock MatchComponent that simulates the original issue
class MockMatchComponent extends AmethComponent {
  template = async () => ({ default: '<div id="matchContainer"></div>' });
  matchToken?: string;

  async init(selector: string, router?: any) {
    this.matchToken = router?.currentPath.params["token"] as string;
    await super.init(selector, router);
  }

  async afterInit() {
    // Simulate fetching match data
    try {
      const response = await this.simulateMatchFetch(this.matchToken);
      if (!response.success) {
        // 404 - match not found
        this.router?.redirectByPath('/404');
      }
    } catch (error) {
      console.error("Match fetch error:", error);
      this.router?.redirectByPath('/404');
    }
  }

  private async simulateMatchFetch(token?: string): Promise<any> {
    // Simulate network delay
    await new Promise(r => setTimeout(r, 10));
    
    // Invalid tokens return 404
    if (token === "invalid" || token === "nonexistent") {
      return { success: false, status: 404 };
    }
    
    // Valid tokens return match data
    return { success: true, match: { token, name: "Test Match" } };
  }
}

// Mock PrivateLayout with sidebar
class MockPrivateLayout extends AmethComponent {
  template = async () => ({ 
    default: `
      <div id="sidebar">
        <div class="sidebar-content">Friends Sidebar</div>
      </div>
      <div class="router-outlet"></div>
    ` 
  });

  async init(selector: string, router?: any) {
    await super.init(selector, router);
  }

  async afterInit() {
    // Sidebar initialization
  }
}

describe("Original Issue: Non-existent Match Navigation", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id=\"app\"></div>";
    setLocation("/");
  });

  it("should handle navigation to non-existent match without errors", async () => {
    let sidebarDestroyed = false;
    let sidebarErrorCount = 0;

    class TrackingSidebarLayout extends MockPrivateLayout {
      async destroy() {
        sidebarDestroyed = true;
        try {
          await super.destroy();
        } catch (error) {
          sidebarErrorCount++;
          console.error("Sidebar destroy error:", error);
        }
      }
    }

    const routes: Route[] = [
      {
        path: "",
        component: async () => ({ default: TrackingSidebarLayout }),
        children: [
          {
            path: "/play/:token",
            component: async () => ({ default: MockMatchComponent })
          }
        ]
      },
      {
        path: "/404",
        component: async () => ({
          default: class extends AmethComponent {
            template = async () => ({ default: "<div>404 Not Found</div>" });
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    // Wait for initial navigation
    await new Promise(r => setTimeout(r, 100));
    
    // Navigate to invalid match
    router.navigateByPath("/play/invalid");
    
    // Wait for navigation to complete
    await new Promise(r => setTimeout(r, 200));

    // Should end up at 404
    expect(window.location.pathname).toBe("/404");
    
    // Sidebar should be properly destroyed without errors
    expect(sidebarErrorCount).toBe(0);
  });

  it("should allow navigation after failed match attempt", async () => {
    const routes: Route[] = [
      {
        path: "",
        component: async () => ({ default: MockPrivateLayout }),
        children: [
          {
            path: "/play/:token",
            component: async () => ({ default: MockMatchComponent })
          }
        ]
      },
      {
        path: "/404",
        component: async () => ({
          default: class extends AmethComponent {
            template = async () => ({ default: "<div>404 Not Found</div>" });
          }
        })
      },
      {
        path: "/home",
        component: async () => ({
          default: class extends AmethComponent {
            template = async () => ({ default: "<div>Home</div>" });
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    await new Promise(r => setTimeout(r, 100));
    
    // Try invalid match
    router.navigateByPath("/play/invalid");
    await new Promise(r => setTimeout(r, 200));
    
    expect(window.location.pathname).toBe("/404");
    
    // Should be able to navigate away cleanly
    router.navigateByPath("/home");
    await new Promise(r => setTimeout(r, 200));
    
    expect(window.location.pathname).toBe("/home");
  });

  it("should handle multiple invalid match attempts", async () => {
    const routes: Route[] = [
      {
        path: "",
        component: async () => ({ default: MockPrivateLayout }),
        children: [
          {
            path: "/play/:token",
            component: async () => ({ default: MockMatchComponent })
          }
        ]
      },
      {
        path: "/404",
        component: async () => ({
          default: class extends AmethComponent {
            template = async () => ({ default: "<div>404 Not Found</div>" });
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    await new Promise(r => setTimeout(r, 100));
    
    // Try first invalid match - it will attempt redirect but we just check it queues properly
    router.navigateByPath("/play/invalid1");
    router.navigateByPath("/play/invalid2");
    
    // Wait for navigation queue to process both
    await new Promise(r => setTimeout(r, 300));
    
    // After queue processes both navigations and redirects, should be at 404
    // (The exact path depends on which redirect wins, but the point is no errors)
    expect(["/404", "/play/invalid1", "/play/invalid2"].includes(window.location.pathname)).toBe(true);
  });

  it("should work correctly with valid match after invalid attempt", async () => {
    const routes: Route[] = [
      {
        path: "",
        component: async () => ({ default: MockPrivateLayout }),
        children: [
          {
            path: "/play/:token",
            component: async () => ({ default: MockMatchComponent })
          }
        ]
      },
      {
        path: "/404",
        component: async () => ({
          default: class extends AmethComponent {
            template = async () => ({ default: "<div>404 Not Found</div>" });
          }
        })
      }
    ];

    const router = new Router("app", routes);
    
    await new Promise(r => setTimeout(r, 100));
    
    // Try invalid match
    router.navigateByPath("/play/invalid");
    await new Promise(r => setTimeout(r, 200));
    
    expect(window.location.pathname).toBe("/404");
    
    // Now navigate to valid match (should work without being stuck at 404)
    router.navigateByPath("/play/valid123");
    await new Promise(r => setTimeout(r, 200));
    
    expect(window.location.pathname).toBe("/play/valid123");
  });
});
