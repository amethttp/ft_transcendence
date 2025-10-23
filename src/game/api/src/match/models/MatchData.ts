import { randomInt } from "crypto";
import { BallChange } from "./BallChange";
import { PaddleChange } from "./PaddleChange";

export class MatchData {
  private _id: number;
  private _ball: BallChange;
  private _paddles: Record<string, PaddleChange>;
  private _score: number[];

  constructor() {
    this._id = 0;
    this._ball = {
      position: { x: 500, y: 500 },
      direction: { x: ((randomInt(10) / 10) * 2) - 1, y: ((randomInt(10) / 10) * 2) - 1 }, // TODO: Normalize vectors to get an actual correct random dir
      velocity: 50,
    };
    this._paddles = {};
    this._score = [0,0];
  }

  public get id(): number {
    return this._id;
  } 

  public get score(): number[] {
    return this._score;
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