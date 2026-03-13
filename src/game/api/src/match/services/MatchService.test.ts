import test from "node:test";
import assert from "node:assert/strict";
import { MatchService } from "./MatchService";
import { PongSettings } from "../models/PongSettings";

const s = PongSettings;

function getMatchData(matchService: MatchService) {
  return (matchService as unknown as { _matchData: any })._matchData;
}

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

test("swaps existing player when explicitly requesting an occupied side", () => {
  const matchService = new MatchService([0, 0]);

  matchService.addPlayer("left-player", 0);
  matchService.addPlayer("new-player", 0);

  const paddlesByPlayer = new Map(
    matchService.snapshot.paddles.map((paddle) => [paddle.playerId, paddle.side])
  );

  assert.equal(paddlesByPlayer.get("new-player"), 0);
  assert.equal(paddlesByPlayer.get("left-player"), 1);
});

test("falls back to first available side when no side is specified", () => {
  const matchService = new MatchService([0, 0]);

  matchService.addPlayer("left-player", 0);
  matchService.addPlayer("fallback-player");

  const paddlesByPlayer = new Map(
    matchService.snapshot.paddles.map((paddle) => [paddle.playerId, paddle.side])
  );

  assert.equal(paddlesByPlayer.get("left-player"), 0);
  assert.equal(paddlesByPlayer.get("fallback-player"), 1);
});

test("snapshot paddles are ordered by side (left then right)", () => {
  const matchService = new MatchService([0, 0]);

  matchService.addPlayer("right-first", 1);
  matchService.addPlayer("left-second", 0);

  const sides = matchService.snapshot.paddles.map((paddle) => paddle.side);
  const players = matchService.snapshot.paddles.map((paddle) => paddle.playerId);

  assert.deepEqual(sides, [0, 1]);
  assert.deepEqual(players, ["left-second", "right-first"]);
});

test("ball collides with left paddle only inside paddle x-range", () => {
  const matchService = new MatchService([0, 0]);
  matchService.addPlayer("left-player", 0);

  const matchData = getMatchData(matchService);
  const paddle = matchData.leftPaddle;
  assert.ok(paddle);

  paddle.position = s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2;
  matchData.ball.position.x = (s.PADDLE_OFFSET + s.PADDLE_WIDTH) - (s.BALL_SIZE / 2);
  matchData.ball.position.y = paddle.position + (s.PADDLE_SIZE / 2) - (s.BALL_SIZE / 2);
  matchData.ball.direction.x = -1;
  matchData.ball.direction.y = 0;
  matchData.ball.velocity = 1;

  const changed = matchService.updateBall();

  assert.equal(changed, true);
  assert.ok(matchData.ball.direction.x > 0);
});

test("ball ignores left paddle exterior side", () => {
  const matchService = new MatchService([0, 0]);
  matchService.addPlayer("left-player", 0);

  const matchData = getMatchData(matchService);
  const paddle = matchData.leftPaddle;
  assert.ok(paddle);

  paddle.position = s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2;
  matchData.ball.position.x = s.PADDLE_OFFSET - s.BALL_SIZE - 1;
  matchData.ball.position.y = paddle.position + (s.PADDLE_SIZE / 2) - (s.BALL_SIZE / 2);
  matchData.ball.direction.x = -1;
  matchData.ball.direction.y = 0;
  matchData.ball.velocity = 1;

  const changed = matchService.updateBall();

  assert.equal(changed, false);
  assert.equal(matchData.ball.direction.x, -1);
});

test("ball ignores right paddle exterior side", () => {
  const matchService = new MatchService([0, 0]);
  matchService.addPlayer("right-player", 1);

  const matchData = getMatchData(matchService);
  const paddle = matchData.rightPaddle;
  assert.ok(paddle);

  paddle.position = s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2;
  matchData.ball.position.x = (s.MAX_WIDTH - s.PADDLE_OFFSET) + 1;
  matchData.ball.position.y = paddle.position + (s.PADDLE_SIZE / 2) - (s.BALL_SIZE / 2);
  matchData.ball.direction.x = 1;
  matchData.ball.direction.y = 0;
  matchData.ball.velocity = 1;

  const changed = matchService.updateBall();

  assert.equal(changed, false);
  assert.equal(matchData.ball.direction.x, 1);
});

test("holding up then pressing down cancels movement, releasing down restores up", () => {
  const matchService = new MatchService([0, 0]);
  matchService.addPlayer("player", 0);

  const paddle = matchService.snapshot.paddles.find((p) => p.playerId === "player");
  assert.ok(paddle);

  matchService.setPaddleChange("player", "w", true);
  assert.equal(paddle.movementDirection, -1);

  matchService.setPaddleChange("player", "s", true);
  assert.equal(paddle.movementDirection, 0);

  matchService.setPaddleChange("player", "s", false);
  assert.equal(paddle.movementDirection, -1);
});

test("holding down then pressing up cancels movement, releasing up restores down", () => {
  const matchService = new MatchService([0, 0]);
  matchService.addPlayer("player", 0);

  const paddle = matchService.snapshot.paddles.find((p) => p.playerId === "player");
  assert.ok(paddle);

  matchService.setPaddleChange("player", "s", true);
  assert.equal(paddle.movementDirection, 1);

  matchService.setPaddleChange("player", "w", true);
  assert.equal(paddle.movementDirection, 0);

  matchService.setPaddleChange("player", "w", false);
  assert.equal(paddle.movementDirection, 1);
});
