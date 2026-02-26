import test from "node:test";
import assert from "node:assert/strict";
import { RoomService } from "./RoomService";
import { MatchState } from "../models/MatchState";
import type { MatchResult } from "../models/MatchResult";

function createService() {
  const io = {
    to: () => ({ emit: () => undefined }),
  } as any;

  const apiClient = {
    get: async () => ({}),
    put: async () => ({}),
    delete: async () => ({}),
  } as any;

  return new RoomService(io, apiClient);
}

test("RoomService resolveDraw breaks tied score", () => {
  const service = createService();
  const room = {
    playersAmount: () => 0,
    players: [],
    getPlayerSide: () => undefined,
  } as any;
  const result: MatchResult = {
    score: [2, 2],
    players: [],
    state: MatchState.IN_PROGRESS,
  };

  const originalRandom = Math.random;
  Math.random = () => 0.1;
  const resolved = (service as any).resolveDraw(room, result) as MatchResult;
  Math.random = originalRandom;

  assert.notEqual(resolved.score[0], resolved.score[1]);
  assert.equal(resolved.score[0], 3);
  assert.equal(resolved.score[1], 2);
});

test("RoomService resolveDraw makes remaining connected player win", () => {
  const service = createService();
  const room = {
    playersAmount: () => 1,
    players: [{ id: "socket-right" }],
    getPlayerSide: () => 1,
  } as any;
  const result: MatchResult = {
    score: [4, 4],
    players: [],
    state: MatchState.PAUSED,
  };

  const resolved = (service as any).resolveDraw(room, result) as MatchResult;

  assert.equal(resolved.score[0], 4);
  assert.equal(resolved.score[1], 5);
});

test("RoomService randomWinResult is never a draw", () => {
  const service = createService();
  const result = (service as any).randomWinResult() as MatchResult;

  assert.equal(result.state, MatchState.FINISHED);
  assert.notEqual(result.score[0], result.score[1]);
  assert.ok(
    (result.score[0] === 1 && result.score[1] === 0)
    || (result.score[0] === 0 && result.score[1] === 1)
  );
});

test("RoomService newRoom rejects missing auth cookie", async () => {
  const service = createService();
  await assert.rejects(async () => {
    await service.newRoom(undefined, "token-no-cookie");
  });
});

test("RoomService newRoom rejects settings without platform playerIds", async () => {
  const service = createService();
  await assert.rejects(async () => {
    await service.newRoom("AccessToken=fake;", "token-no-player-ids");
  });
});
