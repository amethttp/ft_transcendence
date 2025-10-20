import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import SocketClient from "../../../../framework/SocketClient/SocketClient";
import type { PlayerTypeValue } from "../MatchComponent";

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: HTMLCanvasElement;
  private _canvasContext!: CanvasRenderingContext2D;
  private _canvasContainer!: HTMLDivElement;
  private _viewportWidth: number = 1600;
  private _viewportHeight: number = 900;
  private _scale!: number;
  private _offsetX!: number;
  private _offsetY!: number;

  constructor(token?: string) {
    super();
    this._token = token;
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._socketClient = new SocketClient('https://localhost:8081');
    this._socketClient.setEvent('connect', () => {
      console.log("Connected:", this._socketClient.id, this._socketClient.connected);
      this._socketClient.emitEvent("joinMatch", this._token);
    });
    this._socketClient.setEvent('handshake', (data) => {
      console.log('Handshake:', data);
      this.emit('opponentConnected', data);
    });
    this._socketClient.setEvent('message', (data) => {
      console.log("Message:", data);
    });
    this._socketClient.setEvent('disconnect', (reason) => {
      console.log("Disconnected:", reason);
    });
  }

  afterInit() {
    // Stone-100 oklch(97% 0.001 106.424)
    // this.outlet!.innerHTML = this._token as string;

    this._canvas = document.getElementById('matchCanvas') as HTMLCanvasElement;
    this._canvasContext = this._canvas.getContext('2d') as CanvasRenderingContext2D;
    this._canvasContainer = document.getElementById('matchCanvasContainer') as HTMLDivElement;

    this.resizeCanvas();
    this.prepareCanvas();
    this.observeResize();
  }

  async refresh(token?: string) {
    this._token = token;
    // this.outlet!.innerHTML = this._token as string;
  }

  setPlayer(type: PlayerTypeValue) {
    console.log("new player", type);
  }

  async destroy(): Promise<void> {
    this._socketClient.disconnect();
    super.destroy();
  }

  private observeResize() {
    const observer = new ResizeObserver(() => {
      this.resizeCanvas();
      this.prepareCanvas();
    });
    observer.observe(this._canvasContainer);
  }

  private resizeCanvas() {
    const gameAspectRatio = 16 / 9;
    const devicePixelRatio = window.devicePixelRatio || 1;

    const containerWidth = this._canvasContainer.clientWidth;
    const containerHeight = this._canvasContainer.clientHeight;
    const containerRatio = containerWidth / containerHeight;

    let cssCanvasWidth: number;
    let cssCanvasHeight: number;

    if (containerRatio > gameAspectRatio) {
      cssCanvasHeight = containerHeight;
      cssCanvasWidth = containerHeight * gameAspectRatio;
    } else {
      cssCanvasWidth = containerWidth;
      cssCanvasHeight = containerWidth / gameAspectRatio;
    }

    this._canvas.style.width = `${cssCanvasWidth}px`;
    this._canvas.style.height = `${cssCanvasHeight}px`;

    this._canvas.width = Math.round(cssCanvasWidth * devicePixelRatio);
    this._canvas.height = Math.round(cssCanvasHeight * devicePixelRatio);

    this._canvas.style.left = `${(containerWidth - cssCanvasWidth) / 2}px`;
    this._canvas.style.top = `${(containerHeight - cssCanvasHeight) / 2}px`;

    const logicalScaleCSS = Math.min(cssCanvasWidth / this._viewportWidth, cssCanvasHeight / this._viewportHeight);
    const finalScale = logicalScaleCSS * devicePixelRatio;

    const offsetXCSS = (cssCanvasWidth - this._viewportWidth * logicalScaleCSS) / 2;
    const offsetYCSS = (cssCanvasHeight - this._viewportHeight * logicalScaleCSS) / 2;

    const offsetXPhysical = offsetXCSS * devicePixelRatio;
    const offsetYPhysical = offsetYCSS * devicePixelRatio;

    this._canvasContext.setTransform(finalScale, 0, 0, finalScale, offsetXPhysical, offsetYPhysical);

    this._scale = logicalScaleCSS;
    this._offsetX = offsetXCSS;
    this._offsetY = offsetYCSS;
  }
  
  private prepareCanvas() {
    this._canvasContext.save();

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

    this._canvasContext.restore();
  }
}
