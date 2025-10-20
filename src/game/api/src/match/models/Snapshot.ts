import { randomInt } from "crypto";
import { BallChange } from "./BallChange";
import { PaddleChange } from "./PaddleChange";

export class Snapshot {
  public id: number;
  public ball: BallChange;
  public paddles: PaddleChange[];
  public score: number[];

  constructor() {
    this.id = 0;
    this.ball = {
      position: { x: 500, y: 500 },
      direction: { x: ((randomInt(10) / 10) * 2) - 1, y: ((randomInt(10) / 10) * 2) - 1 }, // TODO: Normalize vectors to get an actual correct random dir
      velocity: 50,
    };
    this.paddles = [];
    this.score = [0, 0];
  }
}