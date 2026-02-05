import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { ApiClient } from "../ApiClient";
import { ErrorMsg } from "../models/ResponseError";
import { Context } from "../../framework/Context/Context";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });

const clearCookies = () => {
  document.cookie.split(";").forEach((cookie) => {
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
    document.cookie = `${name}=; max-age=0; path=/`;
  });
};

describe("ApiClient auth refresh flow", () => {
  beforeEach(() => {
    clearCookies();
    Context.router = { navigateByPath: vi.fn() } as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearCookies();
  });

  it("uses the latest AccessToken over stale Authorization header", async () => {
    document.cookie = "AccessToken=tokenA; path=/";

    const fetchMock = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient();
    await client.get("/protected", undefined, {
      headers: { Authorization: "Bearer stale" },
    });

    const [, options] = fetchMock.mock.calls[0];
    const headers = options?.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer tokenA");
  });

  it("single-flights refresh for concurrent AUTH_EXPIRED_ACCESS", async () => {
    document.cookie = "AccessToken=expired; path=/";

    const fetchMock = vi.fn(async (url: string, options?: RequestInit) => {
      if (url.includes("/auth/refresh")) {
        document.cookie = "AccessToken=newtoken; path=/";
        return jsonResponse({ success: true });
      }
      if (url.includes("/protected")) {
        const auth = (options?.headers as Record<string, string>)?.Authorization;
        if (auth === "Bearer newtoken") {
          return jsonResponse({ data: "ok" });
        }
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient();
    const [r1, r2] = await Promise.all([
      client.get<{ data: string }>("/protected"),
      client.get<{ data: string }>("/protected"),
    ]);

    expect(r1.data).toBe("ok");
    expect(r2.data).toBe("ok");

    const refreshCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("/auth/refresh")).length;
    expect(refreshCalls).toBe(1);
  });

  it("does not recurse when /auth/refresh itself fails", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient();
    await expect(client.get("/auth/refresh")).rejects.toMatchObject({
      error: ErrorMsg.AUTH_EXPIRED_ACCESS,
    });

    const refreshCalls = fetchMock.mock.calls.filter((c) => String(c[0]).includes("/auth/refresh")).length;
    expect(refreshCalls).toBe(1);
  });

  it("redirects on refresh failure when redirect is enabled", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      if (url.includes("/protected")) {
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient(true);
    await expect(client.get("/protected")).rejects.toMatchObject({
      error: ErrorMsg.AUTH_EXPIRED_ACCESS,
    });

    expect(Context.router.navigateByPath).toHaveBeenCalledWith("/");
  });

  it("does not redirect on refresh failure when redirect is disabled", async () => {
    const fetchMock = vi.fn(async (url: string) => {
      if (url.includes("/auth/refresh")) {
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      if (url.includes("/protected")) {
        return jsonResponse({ error: ErrorMsg.AUTH_EXPIRED_ACCESS }, 401);
      }
      return jsonResponse({ ok: true });
    });
    vi.stubGlobal("fetch", fetchMock);

    const client = new ApiClient(false);
    await expect(client.get("/protected")).rejects.toMatchObject({
      error: ErrorMsg.AUTH_EXPIRED_ACCESS,
    });

    expect(Context.router.navigateByPath).not.toHaveBeenCalled();
  });
});
