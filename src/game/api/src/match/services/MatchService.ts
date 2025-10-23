import { Snapshot } from "../models/Snapshot";
import { BallChange } from "../models/BallChange";
import { PaddleChange } from "../models/PaddleChange";
import { MatchData } from "../models/MatchData";

const MAX_VEL = 20;
const MAX_WIDTH = 1600;
const MAX_HEIGHT = 900;
const WIDTH_OFFSET = 16;
const PADDLE_SIZE = 200;

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
      side: Object.entries(this._matchData.paddles) ? 1 : 0,
      position: 500
    } as PaddleChange;
  }

  public deletePlayer(playerId: string) {
    delete this._matchData.paddles[playerId];
  }

  public updatePaddle(playerId: string, key: string) {
    const paddle = this._matchData.paddles[playerId];
    if (!paddle) { return; }
    let change = 1;
    if (key === "w") {
      change = -1;
    } else if (key !== "s") { return; }

    paddle.position += (change * 10);
    if (paddle.position + PADDLE_SIZE > (MAX_HEIGHT)) {
      paddle.position = MAX_HEIGHT - PADDLE_SIZE;
    }
    if (paddle.position - PADDLE_SIZE < 0) {
      paddle.position = PADDLE_SIZE;
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
    if (this._matchData.ball.position.x < WIDTH_OFFSET && this.isWithinPaddle(this._matchData.ball, this._matchData.paddlesArray[0])) {
      this._matchData.ball.position.x = WIDTH_OFFSET;
      this._matchData.ball.direction.x = 1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
    } else if (this._matchData.ball.position.x > MAX_WIDTH - WIDTH_OFFSET && this.isWithinPaddle(this._matchData.ball, this._matchData.paddlesArray[1])) {
      this._matchData.ball.position.x = MAX_WIDTH - WIDTH_OFFSET;
      this._matchData.ball.direction.x = -1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
    }

    if (this._matchData.ball.position.y < 0) {
      this._matchData.ball.position.y = 0;
      this._matchData.ball.direction.y = 1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
    } else if (this._matchData.ball.position.y > MAX_HEIGHT) {
      this._matchData.ball.position.y = MAX_HEIGHT;
      this._matchData.ball.direction.y = -1;
      this._matchData.ball.velocity = Math.min(this._matchData.ball.velocity + 1, MAX_VEL);
    }

    this._matchData.ball.position.x += (this._matchData.ball.direction.x * this._matchData.ball.velocity);
    this._matchData.ball.position.y += (this._matchData.ball.direction.y * this._matchData.ball.velocity);
  }

  public checkGoal() {
    this._matchData.incrementId();
    if (this._matchData.ball.position.x >= MAX_WIDTH) {
      this._matchData.score[0]++;
    } else if (this._matchData.ball.position.x <= 0) {
      this._matchData.score[1]++;
    } else {
      return;
    }

    this._matchData.ball.position.x = MAX_WIDTH / 2;
    this._matchData.ball.position.y = MAX_HEIGHT / 2;
    let dx, dy, magnitude;
    do {
      dx = Math.random() * 2 - 1;
      dy = Math.random() * 2 - 1;
      magnitude = Math.sqrt(dx * dx + dy * dy);
    } while (
      magnitude === 0 ||
      Math.abs(dx / magnitude) < 0.4 ||
      Math.abs(dy / magnitude) < 0.4
    );

    this._matchData.ball.direction.x = dx / magnitude;
    this._matchData.ball.direction.y = dy / magnitude;
    this._matchData.ball.velocity = 10;
  }

  public checkEndState(maxScore: number): boolean {
    if (this._matchData.score[0] === maxScore || this._matchData.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
