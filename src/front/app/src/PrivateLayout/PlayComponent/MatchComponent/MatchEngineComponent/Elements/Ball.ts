import { VIEWPORT_WIDTH } from "./Viewport";

export default class Ball {
  private static readonly _size: number = VIEWPORT_WIDTH * 0.0075;
  private _xPos: number;
  private _yPos: number;
  private _xVelocity: number;
  private _yVelocity: number;

  constructor(xPos: number, yPos: number) {
    this._xPos = xPos;
    this._yPos = yPos;
    this._xVelocity = 0;
    this._yVelocity = 0;
  }

  public get x(): number {
    return this._xPos;
  }
  
  public get y(): number {
    return this._yPos;
  }
  
  public static get size(): number {
    return this._size;
  }
}