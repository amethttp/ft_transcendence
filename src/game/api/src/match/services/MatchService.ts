import { Snapshot } from "../models/Snapshot";
import { BallChange } from "../models/BallChange";
import { PaddleChange } from "../models/PaddleChange";
import { MatchData } from "../models/MatchData";

const MAX_VEL = 20;
const MAX_DIM = 900;
const PADDLE_SIZE = 135;

export class MatchService {
  private _matchData: MatchData;

  constructor() {
    this._matchData = new MatchData();
  }

  public get snapshot(): Snapshot {
    return {
      id: this._matchData.id,
      ball: this._matchData.ball,
      paddles: this._matchData.paddlesArray,
      score: this._matchData.score,
    } as Snapshot;
  }


  public get score(): number[] {
    return this._matchData.score;
  }


  public addPlayer(newPlayerId: string) {
    this._matchData.paddles[newPlayerId] = {
      timestamp: performance.now(),
      playerId: newPlayerId,
      side: (Object.entries(this._matchData.paddles).length > 0) ? 1 : 0,
      position: 450 - PADDLE_SIZE / 2,
    } as PaddleChange;
  }

  public deletePlayer(playerId: string) {
    delete this._matchData.paddles[playerId];
  }

  public updatePaddle(playerId: string, key: string) {
    const paddle = this._matchData.paddles[playerId];
    if (!paddle) { return; }
    let change = 25;
    if (key === "w") {
      change = -25;
    } else if (key !== "s") { return; }

    paddle.position += (change);
    if ((paddle.position + PADDLE_SIZE) > (MAX_DIM)) {
      paddle.position = MAX_DIM - PADDLE_SIZE;
    }
    if ((paddle.position) < 0) {
      paddle.position = 0;
    }
  }

  private isWithinPaddle(ball: BallChange, paddle: PaddleChange): boolean {
    if (!paddle) { return false; }
    const topRange = ball.position.y - (paddle.position);
    if (topRange < 0) { return false; }

    const bottomRange = (paddle.position + PADDLE_SIZE) - ball.position.y;
    if (bottomRange < 0) { return false; }

    return true;
  }

  private updateBallPosition() {
    this._matchData.ball.position.x += (this._matchData.ball.direction.x * this._matchData.ball.velocity);
    this._matchData.ball.position.y += (this._matchData.ball.direction.y * this._matchData.ball.velocity);
  }

  public updateBall() {
    if (this._matchData.ball.position.x < 116 && this.isWithinPaddle(this._matchData.ball, this._matchData.paddlesArray[0])) {
      this._matchData.ball.position.x = 116;
      this._matchData.ball.direction.x = 1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
      this.updateBallPosition();
      return true;
    } else if (this._matchData.ball.position.x > 1600 - 116 && this.isWithinPaddle(this._matchData.ball, this._matchData.paddlesArray[1])) {
      this._matchData.ball.position.x = 1600 - 116;
      this._matchData.ball.direction.x = -1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
      this.updateBallPosition();
      return true;
    }

    if (this._matchData.ball.position.y < 0) {
      this._matchData.ball.position.y = 0;
      this._matchData.ball.direction.y = 1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
      this.updateBallPosition();
      return true;
    } else if (this._matchData.ball.position.y > MAX_DIM) {
      this._matchData.ball.position.y = MAX_DIM;
      this._matchData.ball.direction.y = -1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
      this.updateBallPosition();
      return true;
    }

    this.updateBallPosition();
    return false;
  }

  public checkGoal() {
    this._matchData.incrementId();
    if (this._matchData.ball.position.x >= 1600) {
      this._matchData.score[0]++;
    } else if (this._matchData.ball.position.x <= 0) {
      this._matchData.score[1]++;
    } else {
      return;
    }

    this._matchData.ball.position.x = 1600 / 2;
    this._matchData.ball.position.y = MAX_DIM / 2;

    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;
    this._matchData.ball.direction.x = Math.sign(Math.random() - 0.5) * Math.cos(angle);
    this._matchData.ball.direction.y = Math.sin(angle);
    this._matchData.ball.velocity = 1;
  }

  public checkEndState(maxScore: number): boolean {
    if (this._matchData.score[0] === maxScore || this._matchData.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
