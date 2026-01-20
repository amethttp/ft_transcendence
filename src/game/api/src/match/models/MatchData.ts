import { randomInt } from "crypto";
import { BallChange } from "./BallChange";
import { PaddleChange } from "./PaddleChange";

export class MatchData {
  private _id: number;
  private _ball: BallChange;
  private _paddles: Record<string, PaddleChange>;
  private _score: number[];

  constructor(score: number[]) {
    this._id = 0;
    this._ball = {
      position: { x: 800, y: 450 },
      direction: { x: ((randomInt(10) / 10) * 2) - 1, y: ((randomInt(10) / 10) * 2) - 1 }, // TODO: Normalize vectors to get an actual correct random dir
      velocity: 1,
    };
    this._paddles = {};
    this._score = score ? score : [0,0];
  }

  public get id(): number {
    return this._id;
  }

  public get score(): number[] {
    return this._score;
  }

  public set score(newScore: number[]) {
    this._score = newScore;
  }

  public get paddles(): Record<string, PaddleChange> {
    return this._paddles;
  }

  public get paddlesArray(): PaddleChange[] {
    return Object.values(this._paddles);
  }

  public get ball(): BallChange {
    return this._ball;
  }

  public incrementId() {
    this._id++;
  }
}