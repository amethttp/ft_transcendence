import { Server } from "socket.io";
import { Player } from "./Player";
import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { Snapshot } from "./Snapshot";
import { MatchService } from "../services/MatchService";
import { PaddleChange } from "./PaddleChange";
import { ApiClient } from "../../HttpClient/ApiClient/ApiClient";
import { MatchState, TMatchState } from "./MatchState";
import { PlayerState } from "./PlayerState";
import EventEmitter from "../../EventEmitter/EventEmitter";
import { BallChange } from "./BallChange";

const MAX_POINTS = 10;

export type RoomEvents = {
  ballChange: BallChange,
  paddleChange: PaddleChange,
  snapshot: Snapshot
};

export class Room extends EventEmitter<RoomEvents> {
  private _io: Server;
  private _token: string;
  private _players: Record<string, Player>;
  private _matchState: TMatchState;
  private _snapshot: Snapshot;
  public interval: any;

  constructor(server: Server, token: string) {
    super();
    this._io = server;
    this._token = token;
    this._players = {};
    this._matchState = MatchState.WAITING;
    this._snapshot = new Snapshot();
  }

  public get token(): string {
    return this._token;
  }

  public get players(): Player[] {
    return Object.values(this._players);
  }

  public get matchState(): TMatchState {
    return this._matchState;
  }

  public set matchState(ms: TMatchState) {
    this._matchState = ms;
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
    if (this.players.length >= 2) { throw "Room already full!" }
    const newPlayer = new Player(socket);
    this._players[socket.id] = newPlayer;
    this._snapshot.paddles.push({ playerId: newPlayer.id, position: 250 } as PaddleChange);
    socket.join(this.token);
  }

  public joinPlayer(socket: AuthenticatedSocket) {
    if (this.players.length >= 2) { throw "Room already full!" }
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
      if (player.state !== PlayerState.READY) {
        return false;
      }
    }

    return true;
  }

  public updatePaddle(socket: AuthenticatedSocket, key: string) {
    const paddle = this._snapshot.paddles.findIndex((paddle) => (paddle.playerId === socket.id));
    if (paddle === -1) { return; }

    MatchService.updatePaddle(this._snapshot, paddle, key);
  }

  public nextSnapshot() {
    MatchService.updateBall(this._snapshot);
    MatchService.checkGoal(this._snapshot);
    this._snapshot.id++;
    this.emit("snapshot", this._snapshot);
  }

  public sendSnapshot(apiClient: ApiClient) {
    if (MatchService.checkEndState(this._snapshot, MAX_POINTS)) {
      this.emit("end", this._snapshot);
      clearInterval(this.interval);
      this._matchState = MatchState.FINISHED;
      const result = {
        ...this._snapshot.score,
        ...this.players,
        state: this._matchState
      };
      apiClient.post(`/${this.token}`, result);
    } else {
      this.emit("snapshot", this._snapshot);
    }
  }

  destroy(): void {
    super.destroy();
  }
} 
