import { Player } from "./Player";
import { PlayerState, TPlayerState } from "./PlayerState";
import { AIDecisionEngine } from "../services/AIDecisionEngine";
import { Snapshot } from "./Snapshot";

export class AIPlayer extends Player {
  private _decisionEngine: AIDecisionEngine;
  private _difficulty: number = 0.85; // Default difficulty (0 = easy, 1 = hard) - HARD by default
  private _lastDecision: -1 | 0 | 1 = 0; // Track last decision across frames

  constructor(difficulty: number = 0.7) {
    super();
    this._id = "AI";
    this._username = "Durandal";
    this._state = PlayerState.READY;
    this._decisionEngine = new AIDecisionEngine();
    this._difficulty = Math.max(0, Math.min(1, difficulty));
    this._decisionEngine.setDifficulty(this._difficulty);
  }

  public get id(): string {
    return this._id;
  }

  public get username(): string {
    return this._username;
  }

  public get state(): string {
    return this._state;
  }

  public set state(newState: TPlayerState) {
    this._state = newState;
  }

  public get difficulty(): number {
    return this._difficulty;
  }

  public set difficulty(level: number) {
    this._difficulty = Math.max(0, Math.min(1, level));
    this._decisionEngine.setDifficulty(this._difficulty);
  }

  /**
   * Get the next move decision from the AI based on current game state
   * Returns: -1 (move up), 0 (stay), 1 (move down)
   */
  public makeDecision(snapshot: Snapshot, paddleSide: 0 | 1, currentPaddlePosition: number): -1 | 0 | 1 {
    this._lastDecision = this._decisionEngine.getDecision(snapshot, paddleSide, currentPaddlePosition);
    return this._lastDecision;
  }

  /**
   * Get the last decision made by the AI (persists across frames)
   */
  public getLastDecision(): -1 | 0 | 1 {
    return this._lastDecision;
  }

  /**
   * Reset AI state (called on match reset/ball goal)
   */
  public resetDecisionEngine(): void {
    this._lastDecision = 0;
    this._decisionEngine.reset();
  }
}