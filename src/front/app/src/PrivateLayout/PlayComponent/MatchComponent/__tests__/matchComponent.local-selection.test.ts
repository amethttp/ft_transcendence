import { beforeEach, describe, expect, it, vi } from "vitest";
import MatchComponent, { PlayerType } from "../MatchComponent";

describe("MatchComponent local opponent selection", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="MatchComponentOpponentPlayer" class="hidden"></div>
      <select id="MatchComponentSelectPlayer">
        <option value="0">CPU</option>
        <option value="1">Local</option>
      </select>
    `;
  });

  it("selecting local triggers local player mode and opponent view", () => {
    const component = new MatchComponent() as any;
    const setPlayer = vi.fn();
    const refreshOpponent = vi.fn();

    component._matchEngineComponent = { setPlayer };
    component._opponentPlayerComponent = {
      player: undefined,
      refresh: refreshOpponent,
    };

    component._fillOpponentView();

    const selectElement = document.getElementById("MatchComponentSelectPlayer") as HTMLSelectElement;
    selectElement.value = String(PlayerType.LOCAL);
    selectElement.dispatchEvent(new Event("change"));

    expect(setPlayer).toHaveBeenCalledWith(PlayerType.LOCAL);
    expect(refreshOpponent).toHaveBeenCalledWith({
      name: "Player 2",
      avatar: "/player2.webp",
      local: true,
      controls: true,
    });

    const opponent = document.getElementById("MatchComponentOpponentPlayer") as HTMLDivElement;
    expect(opponent.classList.contains("flex")).toBe(true);
    expect(opponent.classList.contains("hidden")).toBe(false);
    expect(selectElement.classList.contains("hidden")).toBe(true);
  });
});
