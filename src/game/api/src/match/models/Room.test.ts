import test from "node:test";
import assert from "node:assert/strict";
import { Room } from "./Room";
import { MatchState } from "./MatchState";
import type { MatchSettings } from "./MatchSettings";
import type { AuthenticatedSocket } from "./AuthenticatedSocket";

function createSocket(id: string, userId: number, username: string): AuthenticatedSocket {
  return {
    id,
    userId,
    username,
    join: () => undefined,
    broadcast: {
      to: () => ({ emit: () => undefined }),
    },
  } as unknown as AuthenticatedSocket;
}

function getPaddleSidesBySocketId(room: Room): Map<string, number> {
  const snapshot = (room as any)._matchService.snapshot;
  return new Map(snapshot.paddles.map((paddle: any) => [paddle.playerId, paddle.side]));
}

test("Room maps sides by platform playerIds even when right user joins first", () => {
  const settings: MatchSettings = {
    maxScore: 3,
    local: false,
    tournament: true,
    state: MatchState.WAITING,
    creationTime: "",
    score: [0, 0],
    playerIds: [101, 202],
  };

  const room = new Room("token-room-order", settings);
  const rightUserSocket = createSocket("socket-right", 202, "rightUser");
  const leftUserSocket = createSocket("socket-left", 101, "leftUser");

  room.addHumanPlayer(rightUserSocket);
  room.addHumanPlayer(leftUserSocket);

  const paddleSides = getPaddleSidesBySocketId(room);
  assert.equal(paddleSides.get("socket-left"), 0);
  assert.equal(paddleSides.get("socket-right"), 1);
});

test("Room falls back to first available side when userId is missing from playerIds", () => {
  const settings: MatchSettings = {
    maxScore: 3,
    local: false,
    tournament: true,
    state: MatchState.WAITING,
    creationTime: "",
    score: [0, 0],
    playerIds: [101, 202],
  };

  const room = new Room("token-room-fallback", settings);
  const unknownUserSocket = createSocket("socket-unknown", 999, "unknownUser");
  const knownRightSocket = createSocket("socket-right", 202, "rightUser");

  room.addHumanPlayer(unknownUserSocket);
  room.addHumanPlayer(knownRightSocket);

  const paddleSides = getPaddleSidesBySocketId(room);
  assert.equal(paddleSides.get("socket-unknown"), 0);
  assert.equal(paddleSides.get("socket-right"), 1);
});

test("Room exposes side for a connected player", () => {
  const settings: MatchSettings = {
    maxScore: 3,
    local: false,
    tournament: true,
    state: MatchState.WAITING,
    creationTime: "",
    score: [0, 0],
    playerIds: [101, 202],
  };

  const room = new Room("token-room-side", settings);
  const leftUserSocket = createSocket("socket-left", 101, "leftUser");
  const rightUserSocket = createSocket("socket-right", 202, "rightUser");

  room.addHumanPlayer(leftUserSocket);
  room.addHumanPlayer(rightUserSocket);

  assert.equal(room.getPlayerSide("socket-left"), 0);
  assert.equal(room.getPlayerSide("socket-right"), 1);
});

test("Room rejects users when platform playerIds are empty", () => {
  const settings: MatchSettings = {
    maxScore: 3,
    local: false,
    tournament: false,
    state: MatchState.WAITING,
    creationTime: "",
    score: [0, 0],
    playerIds: [],
  };

  const room = new Room("token-room-empty-ids", settings);
  assert.equal(room.hasExpectedUser(101), false);
  assert.equal(room.hasExpectedUser(undefined), false);
});
