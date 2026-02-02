import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";
import { MatchSettings } from "../models/MatchSettings";

const MATCH_BASE_ROUTE = "/match";

export class RoomService {
  private _gameRooms: Record<string, Room>;
  private _apiClient: ApiClient;
  private io: Server;

  constructor(server: Server, apiClient: ApiClient) {
    this._gameRooms = {};
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

  public async newRoom(cookie: string | undefined, token: string): Promise<Room> {
    let settings = {
      maxScore: 3,
      local: false,
      state: MatchState.WAITING,
      creationTime: "",
      score: [0, 0]
    } as MatchSettings;
    if (cookie) {
      try {
        const opts: RequestInit = { headers: { cookie } };
        settings = await this._apiClient.get(`${MATCH_BASE_ROUTE}/${token}`, undefined, opts);
        console.log("API MATCH FETCH DONE", settings);
      } catch (error) {
        console.log("API MATCH FETCH FAILED", error);
      }
    }

    this._gameRooms[token] = new Room(token, settings);
    return this._gameRooms[token];
  }

  public goLocal(socket: AuthenticatedSocket, room: Room) {
    room.local = true;
    this.deleteMatch(socket.cookie, room.token);
  }

  public playerDisconnect(socket: AuthenticatedSocket, room: Room) {
    socket.leave(room.token);
    clearInterval(room.interval);
    if (room.getPlayer(socket.id)) {
      room.deletePlayer(socket.id);
      if (room.playersAmount() > 0 && room.matchState === MatchState.IN_PROGRESS) {
        room.matchState = MatchState.PAUSED;
        this.io.to(room.token).emit("pause");
      }
    }
    if (room.playersAmount() === 0) {
      if (room.matchState === MatchState.WAITING && room.isExpired()) {
        this.deleteMatch(socket.cookie, room.token);
      } else if (room.matchState !== MatchState.FINISHED && room.matchState !== MatchState.WAITING) {
        this.updateMatch(socket, room.token, room.matchScore);
      }
      delete this._gameRooms[room.token];
    } else {
      if (room.matchState === MatchState.WAITING) {
        this.deleteMatchPlayer(socket.cookie, room.token);
      }
    }
  }

  public startMatch(socket: AuthenticatedSocket, room: Room) {
    if (room.gameEnded()) { return };
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

  private updateMatch(socket: AuthenticatedSocket, token: string, result: number[]) {
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
