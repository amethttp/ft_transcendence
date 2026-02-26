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
import { MatchSettings } from "./MatchSettings";
import StringTime from "../helpers/StringTime";
import { HumanPlayer } from "./HumanPlayer";
import { LocalPlayer } from "./LocalPlayer";
import { AIPlayer } from "./AIPlayer";

export type RoomEvents = {
  ballChange: BallChange,
  paddleChange: PaddleChange[],
  snapshot: Snapshot,
  end: MatchResult
};

export class Room extends EventEmitter<RoomEvents> {
  private _token: string;
  private _local: boolean;
  private _tournament: boolean;
  private _playerIds: number[];
  private _players: Record<string, Player>;
  private _maxPoints: number;
  private _matchState: TMatchState;
  private _matchService: MatchService;
  private _creationTime: string;
  public interval: any;

  constructor(token: string, settings: MatchSettings) {
    super();

    this._token = token;
    this._local = settings.local;
    this._tournament = settings.tournament;
    this._playerIds = settings.playerIds || [];
    this._players = {};
    this._maxPoints = settings.maxScore;
    this._matchState = settings.state;
    this._creationTime = settings.creationTime;

    this._matchService = new MatchService(settings.score);
  }

  public get token(): string {
    return this._token;
  }

  public get players(): Player[] {
    return Object.values(this._players);
  }

  public get local(): boolean {
    return this._local;
  }

  public get tournament(): boolean {
    return this._tournament;
  }

  public get matchState(): TMatchState {
    return this._matchState;
  }

  public get matchScore(): readonly number[] {
    return this._matchService.score;
  }

  public get matchResult(): MatchResult {
    const result = {
      score: this._matchService.score,
      players: this.players.map((player) => player.toDto()),
      state: this._matchState
    } as MatchResult;

    return result;
  }

  public set local(newState: boolean) {
    this._local = newState;
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
    this._matchService.deletePlayer(id);
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

  private getExpectedSide(socket: AuthenticatedSocket): 0 | 1 | undefined {
    if (typeof socket.userId !== "number") { return undefined; }
    const index = this._playerIds.indexOf(socket.userId);
    if (index === 0 || index === 1) {
      return index;
    }

    return undefined;
  }

  public addHumanPlayer(socket: AuthenticatedSocket, preferredSide?: 0 | 1) {
    if (this.players.length >= 2) { throw "Room already full!" }
    const newPlayer = new HumanPlayer(socket);
    this._players[newPlayer.id] = newPlayer;
    this._matchService.addPlayer(newPlayer.id, preferredSide ?? this.getExpectedSide(socket));
    socket.join(this.token);
  }

  public addLocalPlayer() {
    if (this.players.length >= 2) { throw "Room already full!" }
    const newPlayer = new LocalPlayer();
    this._players[newPlayer.id] = newPlayer;
    this._matchService.addPlayer(newPlayer.id);
  }

  public addAIPlayer() {
    if (this.players.length >= 2) { throw "Room already full!" }
    const newPlayer = new AIPlayer();
    this._players[newPlayer.id] = newPlayer;
    this._matchService.addPlayer(newPlayer.id);
  }

  public joinPlayer(socket: AuthenticatedSocket) {
    if (this.players.length >= 2) { throw "Room already full!" }
    const opponent = this.getOpponent(socket.id);
    if (opponent && socket.username === opponent.player.username) {
      throw "User already connected";
    }

    this.addHumanPlayer(socket);
    socket.broadcast.to(this.token).emit("message", `New Opponent: ${socket.username}(${socket.id}`);
    socket.broadcast.to(this.token).emit("handshake", socket.userId);
    if (this._matchState === MatchState.PAUSED) {
      socket.broadcast.to(this.token).emit("reset", socket.userId);
      this.resetPlayersState();
    }
  }

  public allPlayersReady(): boolean {
    const roomPlayers = Object.values(this._players);
    for (const player of roomPlayers) {
      if (player.state !== PlayerState.READY && player.state !== PlayerState.IN_GAME) {
        return false;
      }
    }

    return true;
  }

  public resetPlayersState() {
    const roomPlayers = Object.values(this._players);
    for (const player of roomPlayers) {
      player.state = PlayerState.WAITING;
    }
  }

  public setPaddleChange(socket: AuthenticatedSocket, key: string, isPressed: boolean) {
    if (this.local && (key === "ArrowUp" || key === "ArrowDown")) {
      this._matchService.setPaddleChange("LOCAL", key, isPressed);
    } else {
      this._matchService.setPaddleChange(socket.id, key, isPressed);
    }
  }

  public isExpired(): boolean {
    if (!this._creationTime) { return true; }

    return ((StringTime.timeStampNow() - StringTime.toTimestamp(this._creationTime)) > 300000);
  }

  public gameEnded(): boolean {
    return ((this._matchState === MatchState.FINISHED) || this._matchService.checkEndState(this._maxPoints));
  }

  public nextSnapshot(lastSnapshot: number): number {
    let paddleChange = this._matchService.updatePaddles();
    let ballChange = this._matchService.updateBall();
    this._matchService.checkGoal();
    if (this._matchService.checkEndState(this._maxPoints)) {
      this._matchState = MatchState.FINISHED;

      this.emit("end", this.matchResult);
    }

    if (ballChange)
      this.emit("ballChange", this._matchService.snapshot.ball);

    if (paddleChange)
      this.emit("paddleChange", this._matchService.snapshot.paddles)

    if ((performance.now() - lastSnapshot) > 500) {
      this.emit("snapshot", this._matchService.snapshot);
      return performance.now();
    }

    return lastSnapshot;
  }

  destroy(): void {
    super.destroy();
  }
}
