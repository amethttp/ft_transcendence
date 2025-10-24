import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";

const MATCH_BASE_ROUTE = "/match"

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
      if (room.playersAmount() > 0 && room.matchState === MatchState.IN_PROGRESS)
        room.matchState = MatchState.PAUSED;
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
      }
      delete this._gameRooms[room.token];
    }
  }

  public startMatch(socket: AuthenticatedSocket, room: Room, targetFPS: number) {
    if (room.gameEnded()) { return; }
    this.io.to(room.token).emit("message", "Players are ready! || Starting Match in 3...");
    for (const player of room.players) {
      player.state = PlayerState.IN_GAME;
    }

    this.io.to(room.token).emit("startMatch");
    room.matchState = MatchState.IN_PROGRESS;
    room.interval = setInterval(() => {
      room.nextSnapshot();
    }, targetFPS);

    room.on("snapshot", (snapshot) => {
      this.io.to(room.token).emit("snapshot", snapshot);
    });

    room.on("ballChange", (ballChange) => {
      console.log(ballChange);
    });

    room.on("end", (result) => {
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

  }

  setCredentials(socket: AuthenticatedSocket, val: any) {
    if (val.auth)
      socket.cookie = val.auth;
  }
}