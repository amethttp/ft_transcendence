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

test("RoomService remainingPlayerWinResult gives connected left-side player a forced 1-0 win", () => {
  const service = createService();
  const room = {
    playersAmount: () => 1,
    players: [{ id: "socket-left" }],
    getPlayerSide: () => 0,
  } as any;

  const resolved = (service as any).remainingPlayerWinResult(room) as MatchResult;

  assert.equal(resolved.state, MatchState.FINISHED);
  assert.deepEqual(resolved.score, [1, 0]);
});

test("RoomService remainingPlayerWinResult gives connected right-side player a forced 0-1 win", () => {
  const service = createService();
  const room = {
    playersAmount: () => 1,
    players: [{ id: "socket-right" }],
    getPlayerSide: () => 1,
  } as any;

  const result = (service as any).remainingPlayerWinResult(room) as MatchResult;

  assert.equal(result.state, MatchState.FINISHED);
  assert.deepEqual(result.score, [0, 1]);
});

test("RoomService remainingPlayerWinResult falls back to random 1-0/0-1 when side is unknown", () => {
  const service = createService();
  const room = {
    playersAmount: () => 1,
    players: [{ id: "socket-unknown" }],
    getPlayerSide: () => undefined,
  } as any;

  const result = (service as any).remainingPlayerWinResult(room) as MatchResult;

  assert.equal(result.state, MatchState.FINISHED);
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
