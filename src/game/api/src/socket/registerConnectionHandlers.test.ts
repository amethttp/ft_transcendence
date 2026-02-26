import test, { after, before } from "node:test";
import assert from "node:assert/strict";
import type { AuthenticatedSocket } from "../match/models/AuthenticatedSocket";
import { registerConnectionHandlers } from "./registerConnectionHandlers";

type EventHandler = (...args: any[]) => any;

const originalConsoleLog = console.log;

before(() => {
  console.log = () => undefined;
});

after(() => {
  console.log = originalConsoleLog;
});

test("joinMatch existing-room path does not disconnect and triggers join/reset broadcasts", async () => {
  const handlers: Record<string, EventHandler> = {};
  const broadcastEvents: Array<{ room: string; event: string; payload: any }> = [];
  let disconnected = false;

  const socket = {
    id: "socket-right",
    userId: 202,
    username: "rightUser",
    cookie: "cookie",
    rooms: new Set<string>(),
    on: (event: string, handler: EventHandler) => {
      handlers[event] = handler;
      return socket;
    },
    disconnect: () => {
      disconnected = true;
      return socket;
    },
    leave: () => socket,
    _cleanup: () => undefined,
    broadcast: {
      to: (room: string) => ({
        emit: (event: string, payload?: any) => {
          broadcastEvents.push({ room, event, payload });
        },
      }),
    },
  } as unknown as AuthenticatedSocket;

  let joinPlayerCalled = 0;
  let resetPlayersStateCalled = 0;

  const room = {
    token: "match-token",
    players: [],
    matchScore: [0, 0],
    joinPlayer: (argSocket: AuthenticatedSocket) => {
      assert.equal(argSocket, socket);
      joinPlayerCalled++;
    },
    resetPlayersState: () => {
      resetPlayersStateCalled++;
    },
    gameEnded: () => false,
    deletePlayer: () => undefined,
  };

  let connectionHandler: EventHandler | undefined;
  const io = {
    on: (event: string, handler: EventHandler) => {
      if (event === "connection") {
        connectionHandler = handler;
      }
      return io;
    },
    to: () => ({ emit: () => undefined }),
  } as any;

  const roomService = {
    getRoom: (token: string) => {
      assert.equal(token, "match-token");
      return room;
    },
    cancelDisconnectTimeout: () => undefined,
    newRoom: async () => {
      throw new Error("newRoom should not be called in existing-room path");
    },
    startMatch: () => undefined,
    playerDisconnect: () => undefined,
  } as any;

  registerConnectionHandlers(io, roomService);
  assert.ok(connectionHandler);

  connectionHandler!(socket);
  assert.ok(handlers.joinMatch);

  await handlers.joinMatch("match-token");

  assert.equal(joinPlayerCalled, 1);
  assert.equal(resetPlayersStateCalled, 1);
  assert.equal(disconnected, false);
  assert.deepEqual(
    broadcastEvents.map(({ room, event }) => ({ room, event })),
    [
      { room: "match-token", event: "reset" },
    ]
  );
});

test("joinMatch disconnects when room is already ended and emits end to requester", async () => {
  const handlers: Record<string, EventHandler> = {};
  let disconnected = false;
  const emittedToSocket: Array<{ id: string; event: string; payload: any }> = [];

  const socket = {
    id: "socket-right",
    userId: 202,
    username: "rightUser",
    cookie: "cookie",
    rooms: new Set<string>(),
    on: (event: string, handler: EventHandler) => {
      handlers[event] = handler;
      return socket;
    },
    disconnect: () => {
      disconnected = true;
      return socket;
    },
    leave: () => socket,
    _cleanup: () => undefined,
    broadcast: {
      to: () => ({
        emit: () => undefined,
      }),
    },
  } as unknown as AuthenticatedSocket;

  let deletePlayerCalled = 0;
  const room = {
    token: "match-token",
    players: [],
    matchScore: [7, 3],
    joinPlayer: () => undefined,
    resetPlayersState: () => undefined,
    gameEnded: () => true,
    deletePlayer: (socketId: string) => {
      assert.equal(socketId, "socket-right");
      deletePlayerCalled++;
    },
  };

  let connectionHandler: EventHandler | undefined;
  const io = {
    on: (event: string, handler: EventHandler) => {
      if (event === "connection") {
        connectionHandler = handler;
      }
      return io;
    },
    to: (id: string) => ({
      emit: (event: string, payload?: any) => {
        emittedToSocket.push({ id, event, payload });
      },
    }),
  } as any;

  const roomService = {
    getRoom: (token: string) => {
      assert.equal(token, "match-token");
      return room;
    },
    cancelDisconnectTimeout: () => undefined,
    newRoom: async () => {
      throw new Error("newRoom should not be called in existing-room path");
    },
    startMatch: () => undefined,
    playerDisconnect: () => undefined,
  } as any;

  registerConnectionHandlers(io, roomService);
  assert.ok(connectionHandler);

  connectionHandler!(socket);
  assert.ok(handlers.joinMatch);

  await handlers.joinMatch("match-token");

  assert.equal(deletePlayerCalled, 1);
  assert.equal(disconnected, true);
  assert.deepEqual(emittedToSocket, [{ id: "socket-right", event: "end", payload: [7, 3] }]);
});

test("joinMatch existing-room syncs expected users and allows valid player", async () => {
  const handlers: Record<string, EventHandler> = {};
  const broadcastEvents: Array<{ room: string; event: string; payload: any }> = [];
  let disconnected = false;
  let expected = false;

  const socket = {
    id: "socket-right",
    userId: 202,
    username: "rightUser",
    cookie: "cookie",
    rooms: new Set<string>(),
    on: (event: string, handler: EventHandler) => {
      handlers[event] = handler;
      return socket;
    },
    disconnect: () => {
      disconnected = true;
      return socket;
    },
    leave: () => socket,
    _cleanup: () => undefined,
    broadcast: {
      to: (room: string) => ({
        emit: (event: string, payload?: any) => {
          broadcastEvents.push({ room, event, payload });
        },
      }),
    },
  } as unknown as AuthenticatedSocket;

  let joinPlayerCalled = 0;
  const room = {
    token: "match-token",
    players: [],
    matchScore: [0, 0],
    hasExpectedUser: () => expected,
    joinPlayer: () => {
      joinPlayerCalled++;
    },
    resetPlayersState: () => undefined,
    gameEnded: () => false,
    deletePlayer: () => undefined,
  };

  let connectionHandler: EventHandler | undefined;
  const io = {
    on: (event: string, handler: EventHandler) => {
      if (event === "connection") {
        connectionHandler = handler;
      }
      return io;
    },
    to: () => ({ emit: () => undefined }),
  } as any;

  const roomService = {
    getRoom: () => room,
    syncRoomExpectedUsers: async () => {
      expected = true;
      return true;
    },
    cancelDisconnectTimeout: () => undefined,
    newRoom: async () => {
      throw new Error("newRoom should not be called in existing-room path");
    },
    startMatch: () => undefined,
    playerDisconnect: () => undefined,
  } as any;

  registerConnectionHandlers(io, roomService);
  assert.ok(connectionHandler);

  connectionHandler!(socket);
  assert.ok(handlers.joinMatch);

  await handlers.joinMatch("match-token");

  assert.equal(joinPlayerCalled, 1);
  assert.equal(disconnected, false);
  assert.deepEqual(
    broadcastEvents.map(({ room, event }) => ({ room, event })),
    [{ room: "match-token", event: "reset" }]
  );
});

test("joinMatch emits message and disconnects when newRoom fails", async () => {
  const handlers: Record<string, EventHandler> = {};
  const emittedToSocket: Array<{ id: string; event: string; payload: any }> = [];
  let disconnected = false;

  const socket = {
    id: "socket-fail",
    userId: 202,
    username: "rightUser",
    cookie: "cookie",
    rooms: new Set<string>(),
    on: (event: string, handler: EventHandler) => {
      handlers[event] = handler;
      return socket;
    },
    disconnect: () => {
      disconnected = true;
      return socket;
    },
    leave: () => socket,
    _cleanup: () => undefined,
    broadcast: {
      to: () => ({
        emit: () => undefined,
      }),
    },
  } as unknown as AuthenticatedSocket;

  let connectionHandler: EventHandler | undefined;
  const io = {
    on: (event: string, handler: EventHandler) => {
      if (event === "connection") {
        connectionHandler = handler;
      }
      return io;
    },
    to: (id: string) => ({
      emit: (event: string, payload?: any) => {
        emittedToSocket.push({ id, event, payload });
      },
    }),
  } as any;

  const roomService = {
    getRoom: () => undefined,
    cancelDisconnectTimeout: () => undefined,
    newRoom: async () => {
      throw new Error("Could not fetch match settings");
    },
    startMatch: () => undefined,
    playerDisconnect: () => undefined,
  } as any;

  registerConnectionHandlers(io, roomService);
  assert.ok(connectionHandler);

  connectionHandler!(socket);
  assert.ok(handlers.joinMatch);

  await handlers.joinMatch("match-token");

  assert.equal(disconnected, true);
  assert.deepEqual(emittedToSocket, [{ id: "socket-fail", event: "message", payload: "Could not join match." }]);
});
