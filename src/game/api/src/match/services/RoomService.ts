import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";

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

  public getRoom(token: string): Room {
    return this._gameRooms[token];
  }

  public addRoom(room: Room) {
    this._gameRooms[room.token] = room;
  }

  public newRoom(token: string): Room {
    this._gameRooms[token] = new Room(token);
    return this._gameRooms[token];
  }

  public playerDisconnect(socket: AuthenticatedSocket, room: Room) {
    socket.leave(room.token);
    this.io.to(room.token).emit("message", `${socket.username} left`);
    clearInterval(room.interval);
    if (room.getPlayer(socket.id)) {
      room.deletePlayer(socket.id);
      if (room.playersAmount() > 0 && room.matchState === MatchState.IN_PROGRESS) {
        room.matchState = MatchState.PAUSED;
        this.io.to(room.token).emit("pause");
      }
    }
    if (room.playersAmount() === 0) {
      if (room.matchState === MatchState.WAITING) {
        const opts: RequestInit = {};
        if (!socket.cookie)
          return; // TODO: Throw error
        opts.headers = { cookie: socket.cookie };
        this._apiClient.delete(`${MATCH_BASE_ROUTE}/${room.token}`, undefined, opts)
          .then(() => console.log("API MATCH DELETE DONE"))
          .catch((error) => console.log("API MATCH DELETE FAILED", error));
      } else if (room.matchState !== MatchState.FINISHED) {
        const opts: RequestInit = {};
        if (!socket.cookie)
          return; // TODO: Throw error
        opts.headers = { cookie: socket.cookie };
        this._apiClient.put(`${MATCH_BASE_ROUTE}/${room.token}`, room.matchResult, opts)
          .then((val) => {
            console.log("API RESULT UPDATE DONE");
            this.setCredentials(socket, val);
          })
          .catch((error) => console.log("API RESULT UPDATE FAILED", error));
      }
      delete this._gameRooms[room.token];
    } else {
      if (room.matchState === MatchState.WAITING) {
        const opts: RequestInit = {};
        if (!socket.cookie)
          return; // TODO: Throw error
        opts.headers = { cookie: socket.cookie };
        this._apiClient.delete(`${MATCH_BASE_ROUTE}/${room.token}/player`, undefined, opts)
          .then(() => console.log("API MATCH DELETE DONE"))
          .catch((error) => console.log("API MATCH DELETE FAILED", error));
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
    console.log(this._apiClient);

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
}
