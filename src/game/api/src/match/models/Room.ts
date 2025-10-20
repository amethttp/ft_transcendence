import { Player } from "./Player";
import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { Snapshot } from "./Snapshot";
import { MatchService } from "../services/MatchService";
import { PaddleChange } from "./PaddleChange";
import { MatchState, TMatchState } from "./MatchState";
import { PlayerState } from "./PlayerState";
import EventEmitter from "../../EventEmitter/EventEmitter";
import { BallChange } from "./BallChange";
import { MatchResult } from "./MatchResult";

const MAX_POINTS = 10;

export type RoomEvents = {
  ballChange: BallChange,
  paddleChange: PaddleChange,
  snapshot: Snapshot,
  end: MatchResult
};

export class Room extends EventEmitter<RoomEvents> {
  private _token: string;
  private _players: Record<string, Player>;
  private _matchState: TMatchState;
  private _matchService: MatchService;
  public interval: any;

  constructor(token: string) {
    super();

    this._token = token;
    this._players = {};
    this._matchState = MatchState.WAITING;

    this._matchService = new MatchService();
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
    this._matchService.addPlayer(newPlayer.id);
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
    this._matchService.updatePaddle(socket.id, key);
  }

  public gameEnded() {
    return this._matchService.checkEndState(MAX_POINTS);
  }

  public nextSnapshot() {
    this._matchService.updateBall();
    this._matchService.checkGoal();
    if (this._matchService.checkEndState(MAX_POINTS)) {
      this._matchState = MatchState.FINISHED;
      const result = {
        score: this._matchService.snapshot.score,
        players: this.players,
        state: this._matchState
      } as MatchResult;

      this.emit("end", result);
    }
    this.emit("snapshot", this._matchService.snapshot);
  }

  destroy(): void {
    super.destroy();
  }
} 
