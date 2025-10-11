import { Server } from "socket.io";
import { Room } from "../models/Room";
import { AuthenticatedSocket } from "../models/AuthenticatedSocket";

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
    }
    if (room.playersAmount() === 0) {
      delete this._gameRooms[room.token];
    } 
  }

  public startMatch(room: Room, targetFPS: number) {
    room.emit("message", "Players are ready! || Starting Match in 3...");
    room.interval = setInterval(() => {
      // room.calc state
      // room.send state
      room.emit("message", "TOKEN: " + room.token + " || " + + performance.now());
    }, targetFPS);    
  }
}