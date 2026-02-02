import { describe, it, expect, beforeEach } from "vitest";
import { Router } from "../Router";
import type { Route } from "../Route/Route";

const setLocation = (path: string) => {
  history.replaceState(null, "", `http://localhost:5173${path}`);
};

describe("Router", () => {
  beforeEach(() => {
    document.body.innerHTML = "<div id=\"app\"></div>";
    setLocation("/");
  });

  it("normalizes multiple slashes in normalizeURL", () => {
    const router = new Router("app", [{ path: "/" }]);
    const normalized = (router as any).normalizeURL("http://localhost:5173//////");
    expect(normalized).toBe("/");
  });

  it("redirects safely from guard without crashing", async () => {
    const routes: Route[] = [
      {
        path: "/private",
        guard: async () => ({ redirect: "/login" }),
      },
      {
        path: "/login",
      }
    ];

    const router = new Router("app", routes);
    router.navigateByPath("/private");

    await new Promise((r) => setTimeout(r, 0));
    expect(window.location.pathname).toBe("/login");
  });

  it("does not redirect on public routes", async () => {
    const routes: Route[] = [
      {
        path: "/private",
        guard: async () => ({ redirect: "/login" }),
      },
      {
        path: "/login",
      },
      {
        path: "/register",
      }
    ];

    const router = new Router("app", routes);
    router.navigateByPath("/register");

    await new Promise((r) => setTimeout(r, 0));
    expect(window.location.pathname).toBe("/register");
  });
});
