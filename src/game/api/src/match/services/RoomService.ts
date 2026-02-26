import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";
import { MatchSettings } from "../models/MatchSettings";
import { MatchResult } from "../models/MatchResult";

const MATCH_BASE_ROUTE = "/match";
const RECONNECT_GRACE_TIMEOUT_MS = 120000;

export class RoomService {
  private _gameRooms: Record<string, Room>;
  private _disconnectTimeouts: Record<string, ReturnType<typeof setTimeout>>;
  private _apiClient: ApiClient;
  private io: Server;

  constructor(server: Server, apiClient: ApiClient) {
    this._gameRooms = {};
    this._disconnectTimeouts = {};
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
    delete this._gameRooms[token];
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

  private publicDisconnect(socket: AuthenticatedSocket, room: Room) {
    console.log("public disc");
    if (room.playersAmount() === 0) {
      if (room.matchState === MatchState.WAITING) {
        this.deleteMatchPlayer(socket.cookie, room.token);
        if (room.isExpired()) {
          this.deleteMatch(socket.cookie, room.token);
        }
      } else if (room.matchState !== MatchState.FINISHED) {
        this.updateMatch(socket, room.token, this.resolveDraw(room, room.matchResult));
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
    } else if (room.matchState !== MatchState.WAITING) {
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
    const loserIndex = 1 - winnerIndex;
    const randomResult: MatchResult = {
      score: [0, 0],
      players: [],
      state: MatchState.FINISHED
    };
    randomResult.score[winnerIndex] = 1;
    randomResult.score[loserIndex] = 0;
    return randomResult;
  }

  private resolveDraw(room: Room, result: MatchResult): MatchResult {
    if (result.score.length < 2 || result.score[0] !== result.score[1]) {
      return result;
    }

    let winnerIndex = Math.random() < 0.5 ? 0 : 1;
    if (room.playersAmount() === 1) {
      const remainingPlayer = room.players[0];
      const remainingSide = room.getPlayerSide(remainingPlayer.id);
      if (remainingSide === 0 || remainingSide === 1) {
        winnerIndex = remainingSide;
      }
    }

    const score = [...result.score];
    score[winnerIndex] = score[winnerIndex] + 1;

    return {
      ...result,
      score
    };
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

      const result = this.resolveDraw(currentRoom, currentRoom.matchResult);
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
      this.io.to(room.token).emit("end", result.score);
      clearInterval(room.interval);
      this.removeRoom(room.token);
      const opts: RequestInit = {};
      if (!socket.cookie)
        return; // TODO: Throw error
      opts.headers = { cookie: socket.cookie };
      this._apiClient.put(`${MATCH_BASE_ROUTE}/${room.token}`, result, opts)
        .then((val) => {
          console.log("API RESULT UPDATE DONE");
          this.setCredentials(socket, val);
        })
        .catch((error) => console.log("API RESULT UPDATE FAILED", error));
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
    const opts: RequestInit = {};
    if (!socket.cookie)
      return; // TODO: Throw error
    opts.headers = { cookie: socket.cookie };
    this._apiClient.put(`${MATCH_BASE_ROUTE}/${token}`, result, opts)
      .then((val) => {
        console.log("API RESULT UPDATE DONE");
        this.setCredentials(socket, val);
      })
      .catch((error) => console.log("API RESULT UPDATE FAILED", error));
  }
}
