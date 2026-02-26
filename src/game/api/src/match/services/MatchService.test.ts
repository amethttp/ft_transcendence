import test from "node:test";
import assert from "node:assert/strict";
import { MatchService } from "./MatchService";

test("assigns deterministic sides when right player connects first", () => {
  const matchService = new MatchService([0, 0]);

  matchService.addPlayer("right-socket", 1);
  matchService.addPlayer("left-socket", 0);

  const paddlesByPlayer = new Map(
    matchService.snapshot.paddles.map((paddle) => [paddle.playerId, paddle.side])
  );

  assert.equal(paddlesByPlayer.get("left-socket"), 0);
  assert.equal(paddlesByPlayer.get("right-socket"), 1);
});

test("falls back to first available side when requested side is already occupied", () => {
  const matchService = new MatchService([0, 0]);

  matchService.addPlayer("left-player", 0);
  matchService.addPlayer("fallback-player", 0);

  const paddlesByPlayer = new Map(
    matchService.snapshot.paddles.map((paddle) => [paddle.playerId, paddle.side])
  );

  assert.equal(paddlesByPlayer.get("left-player"), 0);
  assert.equal(paddlesByPlayer.get("fallback-player"), 1);
});
