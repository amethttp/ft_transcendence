import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "./Viewport";

export default class Paddle {
  private static _width: number = VIEWPORT_WIDTH * 0.01;
  private static _height: number = VIEWPORT_HEIGHT * 0.15;
  private _xPos: number;
  private _yPos: number;
  private _verticalIncrement: number;
  
  constructor(xPos: number, yPos: number) {
    this._xPos = xPos;
    this._yPos = yPos;
    this._verticalIncrement = 0;
  }

  public get x(): number {
    return this._xPos;
  }

  public get y(): number {
    return this._yPos;
  }

  public static get width() {
    return Paddle._width;
  }

  public static get height() {
    return Paddle._height;
  }
}