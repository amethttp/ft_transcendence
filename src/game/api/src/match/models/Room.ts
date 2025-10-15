import { Server } from "socket.io";
import { Player } from "./Player";
import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { MatchState } from "./States";
import { Snapshot } from "./Snapshot";
import { MatchService } from "../services/MatchService";

export class Room {
  private _io: Server;
  private _token: string;
  private _players: Record<string, Player>;
  private _matchState: MatchState;
  private _snapshot: Snapshot;
  public interval: any;

  constructor(server: Server, token: string) {
    this._io = server;
    this._token = token;
    this._players = {};
    this._matchState = "WAITING";
    this._snapshot = new Snapshot();
  }
  
  public get token() : string {
    return this._token;
  }

  public get players() : Player[] {
    return Object.values(this._players);
  }

  public get matchState() : MatchState {
    return this._matchState;
  }

  public set matchState(v : MatchState) {
    this._matchState = v;
  }  

  public emit(ev: string, ...args: any[]): boolean {
    return this._io.to(this._token).emit(ev, ...args);
  }

  public playersAmount(): number {
    return this.players.length;
  }

  public getPlayer(id: string) {
    return this._players[id];
  }

  public deletePlayer(id: string) {
    delete this._players[id];
  }

  public getOpponent(socketId: string): { id: string, player: Player } | null {
    const roomPlayers = Object.keys(this._players);
    for (const player of roomPlayers) {
      if (player !== socketId) {
        return { id: player, player: this._players[player] };
      }
    }

    return null;
  }

  public addPlayer(socket: AuthenticatedSocket) {
    const newPlayer = new Player(socket);
    this._players[socket.id] = newPlayer;
    socket.join(this.token);
  }

  public joinPlayer(socket: AuthenticatedSocket) {
    const opponent = this.getOpponent(socket.id);
    if (opponent && socket.username === opponent.player.username) {
      throw "User already connected";
    }

    this.addPlayer(socket);
    socket.broadcast.to(this.token).emit("message", `New Opponent: ${socket.username}(${socket.id}`);
    socket.broadcast.to(this.token).emit("handshake", socket.userId);
  }

  public allPlayersReady(): boolean {
    const roomPlayers = Object.values(this._players);
    for (const player of roomPlayers) {
      if (player.state !== "READY") {
        return false;
      }
    }

    return true;
  }

  public nextSnapshot() {
    MatchService.updateBall(this._snapshot);
    MatchService.checkGoal(this._snapshot);
    this._snapshot.id++;
  }

  public sendSnapshot() {
    if (MatchService.checkEndState(this._snapshot, 10)) {
      this.emit("end", this._snapshot);
      clearInterval(this.interval);
    } else {
      this.emit("snapshot", this._snapshot);
    }
  }
} 
