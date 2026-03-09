import test from "node:test";
import assert from "node:assert/strict";
import { AIDecisionEngine } from "./AIDecisionEngine";
import type { Snapshot } from "../models/Snapshot";
import { PongSettings } from "../models/PongSettings";

const s = PongSettings;

function makeSnapshot(ball: Snapshot["ball"]): Snapshot {
  return {
    id: 1,
    score: [0, 0],
    ball,
    paddles: [
      {
        timestamp: 0,
        playerId: "human",
        side: 0,
        position: s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2,
        movementDirection: 0,
      },
      {
        timestamp: 0,
        playerId: "AI",
        side: 1,
        position: s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2,
        movementDirection: 0,
      },
    ],
  };
}

test("AIDecisionEngine predicts straight no-bounce shot without vertical drift", () => {
  const engine = new AIDecisionEngine() as any;
  const snapshot = makeSnapshot({
    position: { x: 400, y: 333 },
    direction: { x: 1, y: 0 },
    velocity: 4,
  });

  const prediction = engine.predictBallPosition(snapshot, 1);

  assert.equal(prediction.estimatedBallY, 333);
});

test("AIDecisionEngine keeps multi-bounce prediction inside play zone bounds", () => {
  const engine = new AIDecisionEngine() as any;
  const maxY = s.MAX_HEIGHT - s.BALL_SIZE;
  const snapshot = makeSnapshot({
    position: { x: 280, y: maxY - 1 },
    direction: { x: 1, y: 0.97 },
    velocity: s.MAX_VEL,
  });

  const prediction = engine.predictBallPosition(snapshot, 1);

  assert.ok(prediction.estimatedBallY >= 0);
  assert.ok(prediction.estimatedBallY <= maxY);
});

test("AIDecisionEngine uses bounded center-weighted target when ball moves away", () => {
  const engine = new AIDecisionEngine() as any;
  const snapshot = makeSnapshot({
    position: { x: 700, y: 100 },
    direction: { x: -1, y: 0.2 },
    velocity: 5,
  });

  const prediction = engine.predictBallPosition(snapshot, 1);
  const center = s.MAX_HEIGHT / 2 - s.PADDLE_SIZE / 2;
  const expected = center * 0.8 + 100 * 0.2;

  assert.equal(prediction.estimatedBallY, expected);
});

test("AIDecisionEngine hysteresis avoids instant direction flip near centerline", () => {
  const engine = new AIDecisionEngine() as any;

  engine.currentDecision = 1;
  engine.targetPaddleY = 300;

  const almostCenteredPaddle = 300 + s.PADDLE_SIZE / 2 - 1;
  const movement = engine.calculatePaddleMovement(almostCenteredPaddle);

  assert.equal(movement, 0);
});
