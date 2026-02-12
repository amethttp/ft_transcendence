import { BallChange } from "./BallChange";
import { PaddleChange } from "./PaddleChange";
import { PongSettings } from "./PongSettings";

const s = PongSettings;

export class MatchData {
  private _id: number;
  private _ball: BallChange;
  private _paddles: Record<string, PaddleChange>;
  private _score: number[];

  constructor(score: number[]) {
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;

    this._id = 0;
    this._ball = {
      position: {
        x: s.MAX_WIDTH / 2,
        y: s.MAX_HEIGHT / 2
      },
      direction: {
        x: Math.sign(Math.random() - 0.5) * Math.cos(angle),
        y: Math.sin(angle)
      },
      velocity: 1,
    };
    this._paddles = {};
    this._score = score ? score : [0, 0];
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

  public get rightPaddle(): PaddleChange | undefined {
    return Object.values(this._paddles).find(p => p.side === 1);
  }

  public get leftPaddle(): PaddleChange | undefined {
    return Object.values(this._paddles).find(p => p.side === 0);
  }

  public get ball(): BallChange {
    return this._ball;
  }

  public incrementId() {
    this._id++;
  }

  public updateBallVelocity() {
    this._ball.velocity = Math.min(this._ball.velocity + s.VEL_INCREMENT, s.MAX_VEL);
  }

  public updateBallPosition() {
    this._ball.position.x += (this._ball.direction.x * this._ball.velocity);
    this._ball.position.y += (this._ball.direction.y * this._ball.velocity);
  }

  public resetBallVelocityAndPosition() {
    this._ball.position.x = s.MAX_WIDTH / 2;
    this._ball.position.y = s.MAX_HEIGHT / 2;
    this._ball.velocity = 1;
  }

  public generateBallDirection() {
    const angle = (Math.random() * Math.PI / 2) - Math.PI / 4;

    this._ball.direction.x = Math.sign(Math.random() - 0.5) * Math.cos(angle);
    this._ball.direction.y = Math.sin(angle);
  }
}