import { Snapshot } from "../models/Snapshot";
import { PaddleChange } from "../models/PaddleChange";
import { MatchData } from "../models/MatchData";
import { PongSettings } from "../models/PongSettings";

const s = PongSettings;
const LEFT_PADDLE_MIN_X = s.PADDLE_OFFSET;
const LEFT_PADDLE_MAX_X = s.PADDLE_OFFSET + s.PADDLE_WIDTH;
const RIGHT_PADDLE_MIN_X = s.MAX_WIDTH - (s.PADDLE_OFFSET + s.PADDLE_WIDTH);
const RIGHT_PADDLE_MAX_X = s.MAX_WIDTH - s.PADDLE_OFFSET;
const LEFT_LIMIT = LEFT_PADDLE_MAX_X;
const RIGHT_LIMIT = RIGHT_PADDLE_MIN_X;

export class MatchService {
  private _matchData: MatchData;
  private _paddleKeyState: Record<string, { up: boolean; down: boolean }>;

  constructor(score: number[]) {
    this._matchData = new MatchData(score);
    this._paddleKeyState = {};
    
  }

  public get snapshot(): Snapshot {
    return {
      id: this._matchData.id,
      ball: this._matchData.ball,
      paddles: this._matchData.paddlesArray,
      score: this._matchData.score,
    } as Snapshot;
  }

  public get score(): readonly number[] {
    return this._matchData.score;
  }

  public addPlayer(newPlayerId: string, side?: 0 | 1) {
    let paddleSide = side;
    if (paddleSide !== undefined) {
      const existingPaddle = Object.values(this._matchData.paddles).find(p => p.side === paddleSide);
      if (existingPaddle) {
        existingPaddle.side = (1 - paddleSide) as 0 | 1;
      }
    } else {
      const occupiedSides = new Set(Object.values(this._matchData.paddles).map((paddle) => paddle.side));
      paddleSide = occupiedSides.has(0) ? 1 : 0;
    }

    this._matchData.paddles[newPlayerId] = {
      timestamp: performance.now(),
      playerId: newPlayerId,
      side: paddleSide,
      position: (s.MAX_HEIGHT / 2) - s.PADDLE_SIZE / 2,
    } as PaddleChange;

    this._paddleKeyState[newPlayerId] = { up: false, down: false };
  }

  public deletePlayer(playerId: string) {
    delete this._matchData.paddles[playerId];
    delete this._paddleKeyState[playerId];
  }

  private isUpKey(key: string): boolean {
    return key === "w" || key === "ArrowUp";
  }

  private isDownKey(key: string): boolean {
    return key === "s" || key === "ArrowDown";
  }

  private updateMovementDirection(playerId: string, paddle: PaddleChange): void {
    const keyState = this._paddleKeyState[playerId] ?? { up: false, down: false };
    if (keyState.up === keyState.down) {
      paddle.movementDirection = 0;
      return;
    }

    paddle.movementDirection = keyState.up ? -1 : 1;
  }

  public setPaddleChange(playerId: string, key: string, isPressed: boolean) {
    const paddle = this._matchData.paddles[playerId];
    if (!paddle) { return; }

    const keyState = this._paddleKeyState[playerId] ?? { up: false, down: false };
    if (this.isUpKey(key)) {
      keyState.up = isPressed;
    } else if (this.isDownKey(key)) {
      keyState.down = isPressed;
    } else {
      return;
    }

    this._paddleKeyState[playerId] = keyState;
    this.updateMovementDirection(playerId, paddle);
  }

  private updatePaddle(paddle: PaddleChange): number {
    if (!paddle) { return 0; }
    if (!paddle.movementDirection) { return 0; }

    paddle.position += paddle.movementDirection * s.PADDLE_VELOCITY;
    if ((paddle.position + s.PADDLE_SIZE) > (s.MAX_HEIGHT)) {
      paddle.position = s.MAX_HEIGHT - s.PADDLE_SIZE;
    }
    if ((paddle.position) < 0) {
      paddle.position = 0;
    }

    return 1;
  }

  public updatePaddles(): boolean {
    let res = 0;
    for (const paddle of this._matchData.paddlesArray) {
      res |= this.updatePaddle(paddle);
    }

    return res > 0;
  }

  private isBallWithinPaddle(paddle: PaddleChange | undefined): boolean {
    if (!paddle) { return false; }
    const topRange = (this._matchData.ball.position.y + s.BALL_SIZE) - (paddle.position);
    if (topRange < 0) { return false; }

    const bottomRange = (paddle.position + s.PADDLE_SIZE) - this._matchData.ball.position.y;
    if (bottomRange < 0) { return false; }

    return true;
  }

  private isBallOutLeft(): boolean {
    return this._matchData.ball.position.x < LEFT_LIMIT;
  }

  private isBallOutRight(): boolean {
    return this._matchData.ball.position.x + s.BALL_SIZE > RIGHT_LIMIT;
  }

  private isBallWithinHorizontalRange(rangeMin: number, rangeMax: number): boolean {
    const ballLeft = this._matchData.ball.position.x;
    const ballRight = this._matchData.ball.position.x + s.BALL_SIZE;

    return ballLeft < rangeMax && ballRight > rangeMin;
  }

  private paddleCollision(paddle: PaddleChange | undefined) {
    if (!paddle) { return false; }
    const paddleCenter = paddle.position + s.PADDLE_SIZE / 2;
    const preClampedOffset = (this._matchData.ball.position.y + s.BALL_SIZE / 2 - paddleCenter) / (s.PADDLE_SIZE / 2);
    const offset = Math.max(-1, Math.min(1, preClampedOffset));
    const maxAngle = Math.PI / 4;
    const bounceAngle = offset * maxAngle;

    this._matchData.ball.direction.y = Math.sin(bounceAngle);
    this._matchData.ball.direction.x = -Math.sign(this._matchData.ball.direction.x) * Math.cos(bounceAngle);

    // const INFLUENCE = 0.35;
    // if (paddle.movementDirection !== 0) {
    //   this._matchData.ball.direction.y += paddle.movementDirection * INFLUENCE;
    //   const length = Math.hypot(this._matchData.ball.direction.x, this._matchData.ball.direction.y);
    //   this._matchData.ball.direction.x /= length;
    //   this._matchData.ball.direction.y /= length;
    // }
  }

  private checkHorizontalCollisions(): boolean {
    if (
      this.isBallOutLeft()
      && this.isBallWithinPaddle(this._matchData.leftPaddle)
      && this.isBallWithinHorizontalRange(LEFT_PADDLE_MIN_X, LEFT_PADDLE_MAX_X)
    ) {
      this._matchData.ball.position.x = LEFT_LIMIT;
      this.paddleCollision(this._matchData.leftPaddle);
      this._matchData.updateBallVelocity();
      this._matchData.updateBallPosition();
      return true;
    } else if (
      this.isBallOutRight()
      && this.isBallWithinPaddle(this._matchData.rightPaddle)
      && this.isBallWithinHorizontalRange(RIGHT_PADDLE_MIN_X, RIGHT_PADDLE_MAX_X)
    ) {
      this._matchData.ball.position.x = RIGHT_LIMIT - s.BALL_SIZE;
      this.paddleCollision(this._matchData.rightPaddle);
      this._matchData.updateBallVelocity();
      this._matchData.updateBallPosition();
      return true;
    }

    return false;
  }

  private checkVerticalCollisions(): boolean {
    if (this._matchData.ball.position.y < 0) {
      this._matchData.ball.position.y = 0;
      this._matchData.ball.direction.y = 1;
      this._matchData.updateBallPosition();
      return true;
    } else if (this._matchData.ball.position.y + s.BALL_SIZE > s.MAX_HEIGHT) {
      this._matchData.ball.position.y = s.MAX_HEIGHT - s.BALL_SIZE;
      this._matchData.ball.direction.y = -1;
      this._matchData.updateBallPosition();
      return true;
    }

    return false;
  }

  public updateBall(): boolean {
    if (this.checkHorizontalCollisions()) { return true; }
    if (this.checkVerticalCollisions()) { return true; }

    this._matchData.updateBallPosition();
    return false;
  }

  public checkGoal() {
    this._matchData.incrementId();
    if (this._matchData.ball.position.x >= s.MAX_WIDTH) {
      this._matchData.score[0]++;
    } else if (this._matchData.ball.position.x + s.BALL_SIZE <= 0) {
      this._matchData.score[1]++;
    } else {
      return;
    }

    this._matchData.resetBallVelocityAndPosition();
    this._matchData.generateBallDirection();
  }

  public checkEndState(maxScore: number): boolean {
    if (this._matchData.score[0] === maxScore || this._matchData.score[1] === maxScore) {
      return true;
    }

    return false;
  }
}
