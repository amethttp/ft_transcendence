import Ball from "./Ball";
import Paddle from "./Paddle";
import { VIEWPORT_WIDTH, VIEWPORT_HEIGHT } from "./Viewport";

const GAME_ASPECT_RATIO = 16 / 9;

export default class Canvas {
  private _devicePixelRatio!: number;
  private _canvas: HTMLCanvasElement;
  private _canvasContext: CanvasRenderingContext2D;
  private _canvasContainer: HTMLDivElement;
  // private _scale!: number;     TODO: Revisar si es útil al final
  // private _offsetX!: number;
  // private _offsetY!: number;

  constructor() {
    this._canvas = document.getElementById('matchCanvas') as HTMLCanvasElement;
    this._canvasContext = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this._canvasContainer = document.getElementById('matchCanvasContainer') as HTMLDivElement;

    this.resize();
  }

  private getCanvasCssDimensions() {
    const containerWidth = this._canvasContainer.clientWidth;
    const containerHeight = this._canvasContainer.clientHeight;
    const containerRatio = containerWidth / containerHeight;
    let cssCanvasWidth: number;
    let cssCanvasHeight: number;

    if (containerRatio > GAME_ASPECT_RATIO) {
      cssCanvasHeight = containerHeight;
      cssCanvasWidth = containerHeight * GAME_ASPECT_RATIO;
    } else {
      cssCanvasWidth = containerWidth;
      cssCanvasHeight = containerWidth / GAME_ASPECT_RATIO;
    }

    return [ cssCanvasWidth, cssCanvasHeight ];
  }

  private setCanvasDimensions(cssCanvasWidth: number, cssCanvasHeight: number) {
    this._canvas.style.width = `${cssCanvasWidth}px`;
    this._canvas.style.height = `${cssCanvasHeight}px`;

    this._canvas.width = Math.round(cssCanvasWidth * this._devicePixelRatio);
    this._canvas.height = Math.round(cssCanvasHeight * this._devicePixelRatio);

    this._canvas.style.left = `${(this._canvasContainer.clientWidth - cssCanvasWidth) / 2}px`;
    this._canvas.style.top = `${(this._canvasContainer.clientHeight - cssCanvasHeight) / 2}px`;
  }

  private applyCanvasTransformations(cssCanvasWidth: number, cssCanvasHeight: number) {
    const logicalScaleCSS = Math.min(cssCanvasWidth / VIEWPORT_WIDTH, cssCanvasHeight / VIEWPORT_HEIGHT);
    const finalScale = logicalScaleCSS * this._devicePixelRatio;

    const offsetXCSS = (cssCanvasWidth - VIEWPORT_WIDTH * logicalScaleCSS) / 2;
    const offsetYCSS = (cssCanvasHeight - VIEWPORT_HEIGHT * logicalScaleCSS) / 2;

    const offsetXPhysical = offsetXCSS * this._devicePixelRatio;
    const offsetYPhysical = offsetYCSS * this._devicePixelRatio;

    // this._scale = logicalScaleCSS;
    // this._offsetX = offsetXCSS;
    // this._offsetY = offsetYCSS;

    this._canvasContext.setTransform(finalScale, 0, 0, finalScale, offsetXPhysical, offsetYPhysical);
  }

  resize() {
    this._devicePixelRatio = window.devicePixelRatio || 1;
    const [ cssCanvasWidth, cssCanvasHeight ] = this.getCanvasCssDimensions();

    this.setCanvasDimensions(cssCanvasWidth, cssCanvasHeight);
    this.applyCanvasTransformations(cssCanvasWidth, cssCanvasHeight);
  }

  showInitialState() {
    const paddle1 = new Paddle(100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    const paddle2 = new Paddle(VIEWPORT_WIDTH - Paddle.width - 100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    const ball = new Ball(VIEWPORT_WIDTH / 2 - Ball.size / 2, VIEWPORT_HEIGHT / 2 - Ball.size / 2);

    this._canvasContext.fillStyle = 'oklch(21.6% 0.006 56.043)';
    this._canvasContext.fillRect(0, 0, 1600, 900);
    this._canvasContext.fillStyle = "oklch(97% 0.001 106.424)";
    this._canvasContext.fillRect(paddle1.x, paddle1.y, Paddle.width, Paddle.height);
    this._canvasContext.fillRect(paddle2.x, paddle2.y, Paddle.width, Paddle.height);
    this._canvasContext.fillRect(ball.x, ball.y, Ball.size, Ball.size);
  }
}