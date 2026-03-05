import { beforeEach, describe, expect, it, vi } from "vitest";

const { engineCallLog, MatchEngineMock } = vi.hoisted(() => {
  const engineCallLog: string[] = [];

  class MatchEngineMock {
    constructor(token?: string) {
      engineCallLog.push(`constructor:${token}`);
    }

    on(event: string, _handler: unknown) {
      engineCallLog.push(`on:${event}`);
      return this;
    }

    async init(_selector: string) {
      engineCallLog.push("engine:init");
    }

    afterInit() {}
    refresh() {}
    async destroy() {}
  }

  return { engineCallLog, MatchEngineMock };
});

vi.mock("../MatchEngineComponent/MatchEngineComponent", () => ({
  default: MatchEngineMock,
}));

import MatchComponent from "../MatchComponent";

describe("MatchComponent regressions", () => {
  beforeEach(() => {
    engineCallLog.length = 0;
    document.body.innerHTML = `
      <div id="MatchComponentOpponentPlayer" class="hidden"></div>
      <div id="MatchComponentWaitingForOpponent"></div>
    `;
  });

  it("binds match engine listeners before engine init", async () => {
    const component = new MatchComponent();
    const router = {
      currentPath: { params: { token: "token-123" } },
    } as any;

    await component.init("", router);

    const initIndex = engineCallLog.indexOf("engine:init");
    const onOpponentConnectedIndex = engineCallLog.indexOf("on:opponentConnected");
    const onMatchEndedIndex = engineCallLog.indexOf("on:matchEnded");
    const onOpponentLeftIndex = engineCallLog.indexOf("on:opponentLeft");

    expect(initIndex).toBeGreaterThan(-1);
    expect(onOpponentConnectedIndex).toBeGreaterThan(-1);
    expect(onMatchEndedIndex).toBeGreaterThan(-1);
    expect(onOpponentLeftIndex).toBeGreaterThan(-1);
    expect(onOpponentConnectedIndex).toBeLessThan(initIndex);
    expect(onMatchEndedIndex).toBeLessThan(initIndex);
    expect(onOpponentLeftIndex).toBeLessThan(initIndex);
  });

  it("updates opponent state and view when opponentConnected resolves", async () => {
    const component = new MatchComponent() as any;
    component._match = {
      players: [
        { id: 10, user: { id: 1, username: "owner", avatarUrl: "owner.webp" } },
      ],
      tournamentRound: undefined,
    };
    component._loggedUsername = "owner";
    component._matchService = {
      getPlayer: vi.fn().mockResolvedValue({
        id: 11,
        user: { id: 2, username: "opponent", avatarUrl: "opponent.webp" },
      }),
    };
    const refreshOpponent = vi.fn();
    component._opponentPlayerComponent = {
      refresh: refreshOpponent,
    };

    component.opponentConnected(2);
    await Promise.resolve();
    await Promise.resolve();

    expect(component._match.players).toHaveLength(2);
    expect(component._match.players[1].user.username).toBe("opponent");
    expect(refreshOpponent).toHaveBeenCalledWith({
      name: "opponent",
      avatar: "opponent.webp",
    });

    const opponent = document.getElementById("MatchComponentOpponentPlayer") as HTMLDivElement;
    const waiting = document.getElementById("MatchComponentWaitingForOpponent") as HTMLDivElement;
    expect(opponent.classList.contains("flex")).toBe(true);
    expect(opponent.classList.contains("hidden")).toBe(false);
    expect(waiting.classList.contains("hidden")).toBe(true);
  });
});
