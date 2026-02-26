import { describe, it, expect, beforeEach } from "vitest";
import { TabsHelper } from "../TabsHelper";

describe("TabsHelper", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
    history.replaceState(null, "", "http://localhost:5173/");
  });

  it("marks login tab active even when tab href has redirect query", () => {
    document.body.innerHTML = `
      <div id="accessTabs">
        <a id="login" href="/login?redirect=%2Fplay%2Fabc">Log in</a>
        <a id="register" href="/register?redirect=%2Fplay%2Fabc">Register</a>
      </div>
    `;

    const container = document.getElementById("accessTabs") as HTMLElement;
    TabsHelper.checkTabs(container, "/login");

    const loginTab = document.getElementById("login") as HTMLAnchorElement;
    const registerTab = document.getElementById("register") as HTMLAnchorElement;

    expect(loginTab.classList.contains("active")).toBe(true);
    expect(registerTab.classList.contains("active")).toBe(false);
  });

  it("marks register tab active even when current path has query params", () => {
    document.body.innerHTML = `
      <div id="accessTabs">
        <a id="login" href="/login?redirect=%2Fplay%2Fabc">Log in</a>
        <a id="register" href="/register?redirect=%2Fplay%2Fabc">Register</a>
      </div>
    `;

    const container = document.getElementById("accessTabs") as HTMLElement;
    TabsHelper.checkTabs(container, "/register?redirect=%2Fplay%2Fabc");

    const loginTab = document.getElementById("login") as HTMLAnchorElement;
    const registerTab = document.getElementById("register") as HTMLAnchorElement;

    expect(loginTab.classList.contains("active")).toBe(false);
    expect(registerTab.classList.contains("active")).toBe(true);
  });
});
