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
import { MatchMode, TMatchMode } from "./MatchMode";

export type RoomEvents = {
  ballChange: BallChange,
  paddleChange: PaddleChange[],
  snapshot: Snapshot,
  end: MatchResult
};

export class Room extends EventEmitter<RoomEvents> {
  private _token: string;
  private _local: boolean;
  private _mode: TMatchMode;
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
    this._mode = settings.mode;
    this._local = this._mode !== MatchMode.ONLINE;
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

  public get mode(): TMatchMode {
    return this._mode;
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

  public getPlayerSide(id: string): 0 | 1 | undefined {
    const paddle = this._matchService.snapshot.paddles.find(paddle => paddle.playerId === id);
    if (paddle?.side === 0 || paddle?.side === 1) {
      return paddle.side;
    }

    return undefined;
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

  public hasExpectedUser(userId?: number): boolean {
    if (typeof userId !== "number") {
      return false;
    }
    if (!Array.isArray(this._playerIds) || this._playerIds.length === 0) {
      return false;
    }

    return this._playerIds.includes(userId);
  }

  public setExpectedUsers(userIds: number[]) {
    this._playerIds = Array.isArray(userIds) ? [...userIds] : [];
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
    if (this._matchState === MatchState.PAUSED) {
      socket.broadcast.to(this.token).emit("reset", socket.userId);
      this.resetPlayersState();
    }
    else {
      socket.broadcast.to(this.token).emit("handshake", socket.userId);
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
      if (player instanceof HumanPlayer) {
        player.state = PlayerState.WAITING;
      } else {
        player.state = PlayerState.READY;
      }
      // Reset AI decision engine on state reset
      if (player instanceof AIPlayer) {
        player.resetDecisionEngine();
      }
    }
  }

  private getPlayerIdBySide(side: 0 | 1): string | undefined {
    return this._matchService.snapshot.paddles.find((paddle) => paddle.side === side)?.playerId;
  }

  /**
   * Update AI player paddle movements based on game state
   * This is called every game tick to allow AI to make decisions
   */
  private updateAIPlayers(): void {
    const snapshot = this._matchService.snapshot;
    
    for (const player of Object.values(this._players)) {
      if (!(player instanceof AIPlayer)) {
        continue;
      }

      // Find AI's paddle
      const aiPaddleInfo = snapshot.paddles.find(p => p.playerId === player.id);
      if (!aiPaddleInfo) {
        continue;
      }

      const paddleSide = aiPaddleInfo.side as 0 | 1;
      const currentPosition = aiPaddleInfo.position;

      // Get AI's decision (this updates the AI's internal decision state)
      const decision = player.makeDecision(snapshot, paddleSide, currentPosition);

      // Convert decision to key presses
      // Decision: -1 = move up, 0 = stay, 1 = move down
      const upKey = paddleSide === 0 ? "w" : "ArrowUp";
      const downKey = paddleSide === 0 ? "s" : "ArrowDown";

      this._matchService.setPaddleChange(player.id, upKey, decision === -1);
      this._matchService.setPaddleChange(player.id, downKey, decision === 1);
    }
  }

  public setPaddleChange(socket: AuthenticatedSocket, key: string, isPressed: boolean) {
    if (this.mode === MatchMode.AI) {
      if (key === "ArrowUp") {
        this._matchService.setPaddleChange(socket.id, "w", isPressed);
        return;
      }
      if (key === "ArrowDown") {
        this._matchService.setPaddleChange(socket.id, "s", isPressed);
        return;
      }
      this._matchService.setPaddleChange(socket.id, key, isPressed);
      return;
    }

    if (this.mode === MatchMode.LOCAL) {
      const isLeftInput = key === "w" || key === "s";
      const isRightInput = key === "ArrowUp" || key === "ArrowDown";

      if (isLeftInput || isRightInput) {
        const targetSide = isLeftInput ? 0 : 1;
        const targetPlayerId = this.getPlayerIdBySide(targetSide);
        if (!targetPlayerId) {
          return;
        }

        this._matchService.setPaddleChange(targetPlayerId, key, isPressed);
        return;
      }
    }

    this._matchService.setPaddleChange(socket.id, key, isPressed);
  }

  public isExpired(): boolean {
    if (!this._creationTime) { return true; }

    return ((StringTime.timeStampNow() - StringTime.toTimestamp(this._creationTime)) > 300000);
  }

  public gameEnded(): boolean {
    return ((this._matchState === MatchState.FINISHED) || this._matchService.checkEndState(this._maxPoints));
  }

  public nextSnapshot(lastSnapshot: number): number {
    // Update AI players every tick
    this.updateAIPlayers();
    
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
