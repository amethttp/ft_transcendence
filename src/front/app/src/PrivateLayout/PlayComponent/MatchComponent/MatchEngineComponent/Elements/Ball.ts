import type { BallChange } from "../models/BallChange";
import { VIEWPORT_WIDTH } from "./Viewport";

export default class Ball {
  private static readonly _size: number = VIEWPORT_WIDTH * 0.0075;
  private _xPos: number;
  private _yPos: number;
  private _xDirection: number;
  private _yDirection: number;
  private _velocity: number;

  constructor(xPos: number, yPos: number) {
    this._xPos = xPos;
    this._yPos = yPos;
    this._xDirection = 0;
    this._yDirection = 0;
    this._velocity = 0;
  }

  public get x(): number {
    return this._xPos;
  }
  
  public get y(): number {
    return this._yPos;
  }

  public setFromBallChange(ballChange: BallChange) {
    this._xPos = ballChange.position.x;
    this._yPos = ballChange.position.y;
    this._xDirection = ballChange.direction.x;
    this._yDirection = ballChange.direction.y;
    this._velocity = ballChange.velocity;
  }

  public updatePosition(deltaTime: number) {
    this._xPos += this._xDirection * this._velocity * deltaTime;
    this._yPos += this._yDirection * this._velocity * deltaTime;
  }

  public static get size(): number {
    return this._size;
  }
}