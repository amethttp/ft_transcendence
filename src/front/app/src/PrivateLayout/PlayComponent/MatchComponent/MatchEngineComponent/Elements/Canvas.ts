const GAME_ASPECT_RATIO = 16 / 9;

export default class Canvas {
  private _devicePixelRatio!: number;
  private _canvas!: HTMLCanvasElement;
  private _canvasContext!: CanvasRenderingContext2D;
  private _canvasContainer!: HTMLDivElement;
  private _viewportWidth!: number;
  private _viewportHeight!: number;
  private _scale!: number;
  private _offsetX!: number;
  private _offsetY!: number;

  constructor(width: number, height: number) {
    this._canvas = document.getElementById('matchCanvas') as HTMLCanvasElement;
    this._canvasContext = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this._canvasContainer = document.getElementById('matchCanvasContainer') as HTMLDivElement;
    this._viewportWidth = width;
    this._viewportHeight = height;

    this.resize();
  }

  resize() {
    this._devicePixelRatio = window.devicePixelRatio || 1;

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

    this._canvas.style.width = `${cssCanvasWidth}px`;
    this._canvas.style.height = `${cssCanvasHeight}px`;

    this._canvas.width = Math.round(cssCanvasWidth * this._devicePixelRatio);
    this._canvas.height = Math.round(cssCanvasHeight * this._devicePixelRatio);

    this._canvas.style.left = `${(containerWidth - cssCanvasWidth) / 2}px`;
    this._canvas.style.top = `${(containerHeight - cssCanvasHeight) / 2}px`;

    const logicalScaleCSS = Math.min(cssCanvasWidth / this._viewportWidth, cssCanvasHeight / this._viewportHeight);
    const finalScale = logicalScaleCSS * this._devicePixelRatio;

    const offsetXCSS = (cssCanvasWidth - this._viewportWidth * logicalScaleCSS) / 2;
    const offsetYCSS = (cssCanvasHeight - this._viewportHeight * logicalScaleCSS) / 2;

    const offsetXPhysical = offsetXCSS * this._devicePixelRatio;
    const offsetYPhysical = offsetYCSS * this._devicePixelRatio;

    this._canvasContext.setTransform(finalScale, 0, 0, finalScale, offsetXPhysical, offsetYPhysical);

    this._scale = logicalScaleCSS;
    this._offsetX = offsetXCSS;
    this._offsetY = offsetYCSS;
  }

  showInitialState() {
    const paddleWidth = this._viewportWidth * 0.01;
    const paddleHeight = this._viewportHeight * 0.15;
    const ballSize = this._viewportWidth * 0.01;

    const paddle1 = {
      x: 100,
      y: this._viewportHeight / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      velocityY: 0
    };

    const paddle2 = {
      x: this._viewportWidth - paddleWidth - 100,
      y: this._viewportHeight / 2 - paddleHeight / 2,
      width: paddleWidth,
      height: paddleHeight,
      velocityY: 0
    };

    const ball = {
      x: this._viewportWidth / 2 - ballSize / 2,
      y: this._viewportHeight / 2 - ballSize / 2,
      width: ballSize,
      height: ballSize,
      velocityX: 1,
      velocityY: 2
    };

    this._canvasContext.fillStyle = 'oklch(21.6% 0.006 56.043)';
    this._canvasContext.fillRect(0, 0, 1600, 900);
    this._canvasContext.fillStyle = "oklch(97% 0.001 106.424)";
    this._canvasContext.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    this._canvasContext.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    this._canvasContext.fillRect(ball.x, ball.y, ball.width, ball.height);
  }
}