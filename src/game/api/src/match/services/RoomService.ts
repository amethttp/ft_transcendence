import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState } from "../models/MatchState";
import { PlayerState } from "../models/PlayerState";

export class RoomService {
  private _gameRooms: Record<string, Room>;

  constructor() {
    this._gameRooms = {};
  }

  public getRoom(token: string): Room {
    return this._gameRooms[token];
  }

  public addRoom(room: Room) {
    this._gameRooms[room.token] = room;
  }

  public newRoom(io: Server, token: string): Room {
    this._gameRooms[token] = new Room(io, token);
    return this._gameRooms[token];
  }

  public playerDisconnect(socket: AuthenticatedSocket, room: Room) {
    socket.leave(room.token);
    room.emit("message", `${socket.username} left`);
    clearInterval(room.interval);
    if (room.getPlayer(socket.id)) {
      room.deletePlayer(socket.id);
      room.matchState = MatchState.PAUSED;
    }
    if (room.playersAmount() === 0) {
      delete this._gameRooms[room.token];
      if (room.matchState === MatchState.WAITING) {
        // api delete
      }
    }
  }

  public startMatch(room: Room, targetFPS: number, apiClient: ApiClient) {
    room.emit("message", "Players are ready! || Starting Match in 3...");
    for (const player of room.players) {
      player.state = PlayerState.IN_GAME;
    }
    room.interval = setInterval(() => {
      room.nextSnapshot();
      room.sendSnapshot(apiClient);
    }, targetFPS);

    room.on("snapshot", (snapshot) => {

    });

    room.on("ballChange", (ballChange) => {

    });

    room.on("snapshot", (snapshot) => {
      
    });
  }
}