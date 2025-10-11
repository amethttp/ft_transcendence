import { BallChange } from "./BallChange";
import { PaddleChange } from "./PaddleChange";

export interface Snapshot {
  id: number;
  ball: BallChange;
  paddles: PaddleChange[];
  score: number[];
}