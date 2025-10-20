import { randomInt } from "crypto";
import { Snapshot } from "../models/Snapshot";
import { BallChange } from "../models/BallChange";
import { PaddleChange } from "../models/PaddleChange";

const MAX_VEL = 5;
const MAX_DIM = 1000;
const DIM_OFFSET = 10;
const PADDLE_SIZE = 200;

export class MatchService {
  private _snapshot: Snapshot;

  constructor() {
    this._snapshot = new Snapshot();
  }

  public get snapshot() : Snapshot {
    return this._snapshot;
  }

  public addPlayer(newPlayerId: string) {
    this._snapshot.paddles.push({ playerId: newPlayerId, position: 500 } as PaddleChange);
  }

  public updatePaddle(playerId: string, key: string) {
    const paddle = this._snapshot.paddles.findIndex((paddle) => (paddle.playerId === playerId));
    if (paddle === -1) { return; }
    let change = 1;
    if (key === "w") {
      change = -1;
    } else if (key !== "s") { return; }

    this._snapshot.paddles[paddle].position += (change * 10);
    if (this._snapshot.paddles[paddle].position + PADDLE_SIZE > (MAX_DIM)) {
      this._snapshot.paddles[paddle].position = MAX_DIM - PADDLE_SIZE;
    }
    if (this._snapshot.paddles[paddle].position - PADDLE_SIZE < 0) {
      this._snapshot.paddles[paddle].position = PADDLE_SIZE;
    }
  }

  private isWithinPaddle(ball: BallChange, paddle: PaddleChange): boolean {    
    const topRange = ball.position.y - paddle.position;
    if (topRange < 0) { return false; }
    
    const bottomRange = (paddle.position + PADDLE_SIZE) - ball.position.y;
    if (bottomRange < 0) { return false; }
    
    return true;
  }

  public updateBall() {
    if (this._snapshot.ball.position.x < DIM_OFFSET && this.isWithinPaddle(this._snapshot.ball, this._snapshot.paddles[0])) {
      this._snapshot.ball.position.x = DIM_OFFSET;
      this._snapshot.ball.direction.x = 1;
      this._snapshot.ball.velocity = Math.min(this._snapshot.ball.velocity + 1, MAX_VEL);
    } else if (this._snapshot.ball.position.x > MAX_DIM - DIM_OFFSET && this.isWithinPaddle(this._snapshot.ball, this._snapshot.paddles[1])) {
      this._snapshot.ball.position.x = MAX_DIM - DIM_OFFSET;
      this._snapshot.ball.direction.x = -1;
      this._snapshot.ball.velocity = Math.min(this._snapshot.ball.velocity + 1, MAX_VEL);
    }

    if (this._snapshot.ball.position.y < 0) {
      this._snapshot.ball.position.y = 0;
      this._snapshot.ball.direction.y = 1;
      this._snapshot.ball.velocity = Math.min(this._snapshot.ball.velocity + 1, MAX_VEL);
    } else if (this._snapshot.ball.position.y > MAX_DIM) {
      this._snapshot.ball.position.y = MAX_DIM;
      this._snapshot.ball.direction.y = -1;
      this._snapshot.ball.velocity = Math.min(this._snapshot.ball.velocity + 1, MAX_VEL);
    }

    this._snapshot.ball.position.x += (this._snapshot.ball.direction.x * this._snapshot.ball.velocity);
    this._snapshot.ball.position.y += (this._snapshot.ball.direction.y * this._snapshot.ball.velocity);
  }

  public checkGoal() {
    this._snapshot.id++;
    if (this._snapshot.ball.position.x >= MAX_DIM) {
      this._snapshot.score[0]++;
    } else if (this._snapshot.ball.position.x <= 0) {
      this._snapshot.score[1]++;
    } else {
      return;
    }

    this._snapshot.ball.position.x = MAX_DIM / 2;
    this._snapshot.ball.position.y = MAX_DIM / 2;
    const dx = ((randomInt(5) / 10) * 2) - 1;
    const dy = ((randomInt(5) / 10) * 2) - 1;
    const magnitude = Math.sqrt(dx*dx + dy*dy);

    this._snapshot.ball.direction.x = dx / magnitude;
    this._snapshot.ball.direction.y = dy / magnitude;
    this._snapshot.ball.velocity = 10;
  }

  public checkEndState(maxScore: number): boolean {
    if (this._snapshot.score[0] === maxScore || this._snapshot.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
