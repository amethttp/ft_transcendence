import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";

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
      room.matchState = MatchState.PAUSED;
    }
    if (room.playersAmount() === 0) {
      delete this._gameRooms[room.token];
      if (room.matchState === MatchState.WAITING) {
        // const opts: RequestInit = {};
        // opts.headers = {};
        // this._apiClient.delete(`/${room.token}`, undefined, opts)
        // .then(() => console.log("API MATCH DELETE DONE"))
        // .catch(() => console.log("API MATCH DELETE FAILED"));;
      }
    }
  }

  public startMatch(room: Room, targetFPS: number) {
    if (room.gameEnded()) { return; }
    this.io.to(room.token).emit("message", "Players are ready! || Starting Match in 3...");
    for (const player of room.players) {
      player.state = PlayerState.IN_GAME;
    }
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
      console.log(this._apiClient);
      // const opts: RequestInit = {};
      // opts.headers = {};
      // this._apiClient.put(`/${room.token}`, result, opts)
      // .then(() => console.log("API RESULT UPDATE DONE"))
      // .catch(() => console.log("API RESULT UPDATE FAILED"));
    });
  }
}