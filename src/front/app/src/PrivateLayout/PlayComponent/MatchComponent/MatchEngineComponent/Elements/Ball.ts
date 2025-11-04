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

  public get xDir(): number {
    return this._xDirection;
  }

  public get yDir(): number {
    return this._yDirection;
  }

  public get velocity(): number {
    return this._velocity;
  }

  public set x(newX: number) {
    this._xPos = newX;
  }

  public set y(newY: number) {
    this._yPos = newY;
  }

  public set dirX(newDirX: number) {
    this._xDirection = newDirX;
  }

  public set dirY(newDirY: number) {
    this._yDirection = newDirY;
  }

  public set velocity(newVelocity: number) {
    this._velocity = newVelocity;
  }

  public setFromBallChange(ballChange: BallChange) {
    this._xPos = ballChange.position.x;
    this._yPos = ballChange.position.y;
    this._xDirection = ballChange.direction.x;
    this._yDirection = ballChange.direction.y;
    this._velocity = ballChange.velocity;
  }

  public updatePosition(deltaTime: number) {
    this._xPos += this._xDirection * this.velocity * deltaTime;
    this._yPos += this._yDirection * this.velocity * deltaTime;
  }

  public static get size(): number {
    return this._size;
  }
}