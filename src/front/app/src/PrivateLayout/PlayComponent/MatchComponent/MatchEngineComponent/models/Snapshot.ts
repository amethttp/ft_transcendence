import type { BallChange } from "./BallChange";
import type { PaddleChange } from "./PaddleChange";

export interface Snapshot {
  id: number;
  ball: BallChange;
  paddles: PaddleChange[];
  score: number[];
}