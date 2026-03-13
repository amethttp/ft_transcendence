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

test("RoomService updateMatch persists result only once per token", async () => {
  let putCalls = 0;
  const io = {
    to: () => ({ emit: () => undefined }),
  } as any;
  const apiClient = {
    get: async () => ({}),
    put: async () => {
      putCalls += 1;
      return {};
    },
    delete: async () => ({}),
  } as any;

  const service = new RoomService(io, apiClient) as any;
  const socket = { cookie: "AccessToken=ok;" } as any;
  const result = { score: [1, 0], players: [], state: MatchState.FINISHED } as MatchResult;

  service.updateMatch(socket, "token-once", result);
  service.updateMatch(socket, "token-once", result);

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(putCalls, 1);
});

test("RoomService missing-cookie update does not lock token for future updates", async () => {
  let putCalls = 0;
  const io = {
    to: () => ({ emit: () => undefined }),
  } as any;
  const apiClient = {
    get: async () => ({}),
    put: async () => {
      putCalls += 1;
      return {};
    },
    delete: async () => ({}),
  } as any;

  const service = new RoomService(io, apiClient) as any;
  const noCookieSocket = {} as any;
  const cookieSocket = { cookie: "AccessToken=ok;" } as any;
  const result = { score: [0, 1], players: [], state: MatchState.FINISHED } as MatchResult;

  service.updateMatch(noCookieSocket, "token-cookie-late", result);
  service.updateMatch(cookieSocket, "token-cookie-late", result);

  await new Promise((resolve) => setTimeout(resolve, 0));
  assert.equal(putCalls, 1);
});
