import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";
import { MatchSettings } from "../models/MatchSettings";
import { MatchResult } from "../models/MatchResult";
import { MatchMode } from "../models/MatchMode";

const MATCH_BASE_ROUTE = "/match";
const RECONNECT_GRACE_TIMEOUT_MS = 120000;

export class RoomService {
  private _gameRooms: Record<string, Room>;
  private _disconnectTimeouts: Record<string, ReturnType<typeof setTimeout>>;
  private _resultPersistedByToken: Set<string>;
  private _apiClient: ApiClient;
  private io: Server;

  constructor(server: Server, apiClient: ApiClient) {
    this._gameRooms = {};
    this._disconnectTimeouts = {};
    this._resultPersistedByToken = new Set();
    this._apiClient = apiClient;
    this.io = server;
  }

  public get rooms(): Room[] {
    return Object.values(this._gameRooms);
  }

  public getRoom(token: string): Room {
    return this._gameRooms[token];
  }

  public addRoom(room: Room) {
    this._gameRooms[room.token] = room;
  }

  public cancelDisconnectTimeout(token: string) {
    this.clearDisconnectTimeout(token);
  }

  public async syncRoomExpectedUsers(cookie: string | undefined, room: Room): Promise<boolean> {
    if (!cookie) {
      return false;
    }

    try {
      const opts: RequestInit = { headers: { cookie } };
      const settings = await this._apiClient.get<MatchSettings>(`${MATCH_BASE_ROUTE}/${room.token}`, undefined, opts);
      if (!Array.isArray(settings.playerIds) || settings.playerIds.length === 0) {
        return false;
      }
      room.setExpectedUsers(settings.playerIds);
      return true;
    } catch (error) {
      console.log("API MATCH REFRESH FAILED", error);
      return false;
    }
  }

  private removeRoom(token: string) {
    this.clearDisconnectTimeout(token);
    this._resultPersistedByToken.delete(token);
    delete this._gameRooms[token];
  }

  private persistMatchResultOnce(socket: AuthenticatedSocket, token: string, result: MatchResult) {
    if (!socket.cookie) {
      return;
    }

    if (this._resultPersistedByToken.has(token)) {
      return;
    }

    this._resultPersistedByToken.add(token);
    const opts: RequestInit = {};
    opts.headers = { cookie: socket.cookie };

    this._apiClient.put(`${MATCH_BASE_ROUTE}/${token}`, result, opts)
      .then((val) => {
        console.log("API RESULT UPDATE DONE");
        this.setCredentials(socket, val);
      })
      .catch((error) => {
        this._resultPersistedByToken.delete(token);
        console.log("API RESULT UPDATE FAILED", error);
      });
  }

  public async newRoom(cookie: string | undefined, token: string): Promise<Room> {
    if (!cookie) {
      throw new Error("Missing auth cookie for match join");
    }

    let settings: MatchSettings;
    try {
      const opts: RequestInit = { headers: { cookie } };
      settings = await this._apiClient.get(`${MATCH_BASE_ROUTE}/${token}`, undefined, opts);
      console.log("API MATCH FETCH DONE", settings);
    } catch (error) {
      console.log("API MATCH FETCH FAILED", error);
      throw new Error("Could not fetch match settings");
    }

    if (!Array.isArray(settings.playerIds) || settings.playerIds.length === 0) {
      throw new Error("Match has no registered players");
    }

    this._gameRooms[token] = new Room(token, settings);
    return this._gameRooms[token];
  }

  public ensureModePlayers(room: Room): boolean {
    if (room.mode === MatchMode.ONLINE) {
      return false;
    }

    if (room.getPlayer("LOCAL") || room.getPlayer("AI") || room.playersAmount() !== 1) {
      return false;
    }

    if (room.mode === MatchMode.LOCAL) {
      room.addLocalPlayer();
      room.resetPlayersState();
      return true;
    }

    if (room.mode === MatchMode.AI) {
      room.addAIPlayer();
      room.resetPlayersState();
      return true;
    }

    return false;
  }

  private publicDisconnect(socket: AuthenticatedSocket, room: Room) {
    console.log("public disc");
    if (room.playersAmount() === 0) {
      if (room.matchState === MatchState.WAITING) {
        this.deleteMatchPlayer(socket.cookie, room.token);
        if (room.isExpired()) {
          this.deleteMatch(socket.cookie, room.token);
        }
      } else if (room.matchState !== MatchState.FINISHED) {
        this.updateMatch(socket, room.token, this.randomWinResult());
      }
      this.removeRoom(room.token);
    } else {
      if (room.matchState === MatchState.WAITING) {
        this.deleteMatchPlayer(socket.cookie, room.token);
      }
    }
  }

  private localDisconnect(socket: AuthenticatedSocket, room: Room) {
    if (room.matchState === MatchState.WAITING && room.isExpired()) {
      this.deleteMatch(socket.cookie, room.token);
    }
    this.removeRoom(room.token);
  }

  private tournamentDisconnect(socket: AuthenticatedSocket, room: Room) {
    if (room.playersAmount() === 0) {
      if (room.matchState !== MatchState.FINISHED && room.matchState !== MatchState.WAITING) {
        this.updateMatch(socket, room.token, this.randomWinResult());
      }
      this.removeRoom(room.token);
    } 
  }

  private randomWinResult(): MatchResult {
    const winnerIndex = Math.random() < 0.5 ? 0 : 1;
    return this.winResult(winnerIndex);
  }

  private winResult(winnerIndex: 0 | 1): MatchResult {
    if (winnerIndex === 0) {
      return {
        score: [1, 0],
        players: [],
        state: MatchState.FINISHED
      };
    }

    return {
      score: [0, 1],
      players: [],
      state: MatchState.FINISHED
    };
  }

  private remainingPlayerWinResult(room: Room): MatchResult {
    if (room.playersAmount() === 1) {
      const remainingPlayer = room.players[0];
      const remainingSide = room.getPlayerSide(remainingPlayer.id);
      if (remainingSide === 0 || remainingSide === 1) {
        return this.winResult(remainingSide);
      }
    }

    return this.randomWinResult();
  }

  private clearDisconnectTimeout(token: string) {
    const timeout = this._disconnectTimeouts[token];
    if (timeout) {
      clearTimeout(timeout);
      delete this._disconnectTimeouts[token];
    }
  }

  private startReconnectTimeout(socket: AuthenticatedSocket, room: Room) {
    if (room.local || room.playersAmount() !== 1 || room.matchState !== MatchState.PAUSED) {
      return;
    }

    this.clearDisconnectTimeout(room.token);
    this.io.to(room.token).emit("message", "Opponent disconnected. Waiting up to 2 minutes for reconnection...");

    this._disconnectTimeouts[room.token] = setTimeout(() => {
      const currentRoom = this._gameRooms[room.token];
      if (!currentRoom) {
        return;
      }
      if (currentRoom.playersAmount() !== 1 || currentRoom.matchState !== MatchState.PAUSED) {
        return;
      }

      const result = this.remainingPlayerWinResult(currentRoom);
      this.updateMatch(socket, currentRoom.token, result);
      this.io.to(currentRoom.token).emit("end", result.score);
      this.removeRoom(currentRoom.token);
    }, RECONNECT_GRACE_TIMEOUT_MS);
  }

  private roomPlayerRemoval(socket: AuthenticatedSocket, room: Room) {
    if (room.getPlayer(socket.id)) {
      room.deletePlayer(socket.id);
      if (room.playersAmount() > 0 && room.matchState === MatchState.IN_PROGRESS) {
        room.matchState = MatchState.PAUSED;
        this.io.to(room.token).emit("pause");
      }
    }    
  }

  public playerDisconnect(socket: AuthenticatedSocket, room: Room) {
    socket.leave(room.token);
    clearInterval(room.interval);
    this.roomPlayerRemoval(socket, room);
    this.startReconnectTimeout(socket, room);
    console.log("discccc", room.local, room.tournament, room.playersAmount());

    if (room.local) {
      this.localDisconnect(socket, room);
    } else if (room.tournament) {
      this.tournamentDisconnect(socket, room);
    } else {
      this.publicDisconnect(socket, room);
    }
  }

  public startMatch(socket: AuthenticatedSocket, room: Room) {
    if (room.gameEnded()) { return };
    console.log(room.players);
    this.io.to(room.token).emit("message", "Players are ready! || Starting Match in 3...");
    for (const player of room.players) {
      player.state = PlayerState.IN_GAME;
    }
    this.io.to(room.token).emit("start");
    room.matchState = MatchState.IN_PROGRESS;

    const targetFPS = 500;
    const frameTime = 1000 / targetFPS;
    let lastTime = performance.now();
    let lastSnapshot = performance.now();
    let accumulated = 0;
    let running = true;

    room.destroy();

    const loop = (now: number) => {
      if (!running || room.gameEnded() || (room.matchState === MatchState.PAUSED) || (room.matchState === MatchState.FINISHED)) { return };

      const delta = now - lastTime;
      lastTime = now;
      accumulated += delta;

      while (accumulated > frameTime) {
        lastSnapshot = room.nextSnapshot(lastSnapshot);
        accumulated -= frameTime;
      }

      setImmediate(() => loop(performance.now()));
    };

    room.on("snapshot", (snapshot) => {
      this.io.to(room.token).emit("snapshot", snapshot);
    });

    room.on("ballChange", (ballChange) => {
      this.io.to(room.token).emit("ballChange", ballChange);
    });

    room.on("paddleChange", (paddleChange) => {
      this.io.to(room.token).emit("paddleChange", paddleChange);
    });

    room.on("end", (result) => {
      running = false;
      this.finishMatch(socket, room, result.score);
    });

    loop(performance.now());
  }

  setCredentials(socket: AuthenticatedSocket, val: any) {
    if (val.auth)
      socket.cookie = val.auth;
  }

  private deleteMatch(cookie: string | undefined, token: string) {
    const opts: RequestInit = {};
    if (!cookie)
      return; // TODO: Throw error
    opts.headers = { cookie: cookie };
    this._apiClient.delete(`${MATCH_BASE_ROUTE}/${token}`, undefined, opts)
      .then(() => console.log("API MATCH DELETE DONE"))
      .catch((error) => console.log("API MATCH DELETE FAILED", error));
  }

  private deleteMatchPlayer(cookie: string | undefined, token: string) {
    const opts: RequestInit = {};
    if (!cookie)
      return; // TODO: Throw error
    opts.headers = { cookie: cookie };
    this._apiClient.delete(`${MATCH_BASE_ROUTE}/${token}/player`, undefined, opts)
      .then(() => { this.io.to(token).emit("opponentLeft"); console.log("API MATCH DELETE DONE") })
      .catch((error) => console.log("API MATCH DELETE FAILED", error));
  }

  private updateMatch(socket: AuthenticatedSocket, token: string, result: MatchResult) {
    this.persistMatchResultOnce(socket, token, result);
  }

  private endResult(room: Room): MatchResult {
    const result = room.matchResult;
    return {
      score: [...result.score],
      players: result.players,
      state: MatchState.FINISHED,
    };
  }

  private finishMatch(socket: AuthenticatedSocket, room: Room, score: number[]) {
    this.io.to(room.token).emit("end", score);
    clearInterval(room.interval);
    if (!room.local) {
      this.persistMatchResultOnce(socket, room.token, this.endResult(room));
    }
    this.removeRoom(room.token);
  }
}
