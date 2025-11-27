import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import SocketClient from "../../../../framework/SocketClient/SocketClient";
import type { PlayerTypeValue } from "../MatchComponent";
import Ball from "./Elements/Ball";
import Paddle from "./Elements/Paddle";
import Canvas from "./Elements/Canvas";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "./Elements/Viewport";
import type { Snapshot } from "./models/Snapshot";
import CanvasOverlay from "./Elements/CanvasOverlay";
import FullScreenButton from "./Elements/FullScreenButton";

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: Canvas;
  private _canvasOverlay!: CanvasOverlay;
  private _fullScreenButton!: FullScreenButton;
  private _paddles: Paddle[] = [];
  private _inputs: boolean[] = [false, false];
  private _ball: Ball;
  private _animationId: number = 0;
  private _lastTime: number = 0;
  private _deltaTime: number = 0;

  constructor(token?: string) {
    super();
    this._token = token;
    this._paddles[0] = new Paddle(100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._paddles[1] = new Paddle(VIEWPORT_WIDTH - Paddle.width - 100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._ball = new Ball(VIEWPORT_WIDTH / 2 - Ball.size / 2, VIEWPORT_HEIGHT / 2 - Ball.size / 2);
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._socketClient = new SocketClient(import.meta.env.VITE_API_GAME_URL);
    this._socketClient.setEvent('connect', () => {
      console.log("Connected:", this._socketClient.id, this._socketClient.connected);
      this._socketClient.emitEvent("joinMatch", this._token);
    });
    this._socketClient.setEvent('handshake', (data) => {
      console.log('Handshake:', data);
      this.emit('opponentConnected', data);
    });
    this._socketClient.setEvent('start', () => {
      this.startMatch();
    })
    this._socketClient.setEvent('message', (data) => {
      console.log("Message:", data);
    });
    this._socketClient.setEvent("ready", () => {
      this.handleReady();
    });
    this._socketClient.setEvent("snapshot", (data) => {
      this.updateGame(data);
    });
    this._socketClient.setEvent('paddleChange', (paddles) => {
      this._paddles[0].y = paddles[0].position;
      this._paddles[1].y = paddles[1].position;
    });
    this._socketClient.setEvent("ballChange", (data) => {
      this._ball.setFromBallChange(data);
    });
    this._socketClient.setEvent("end", (data) => {
      this.setEndState(data);
    });
    this._socketClient.setEvent('disconnect', (reason) => {
      console.log("Disconnected:", reason);
    });
  }

  afterInit() {
    this._canvas = new Canvas();
    this._canvasOverlay = new CanvasOverlay();
    this._canvasOverlay.onclick(() => this.setReadyToPlay());
    this._fullScreenButton = new FullScreenButton();
    this._fullScreenButton.onclick(() => this._canvas.toggleFullScreen());
    this.observeResize();
    document.addEventListener('fullscreenchange', () => { this._fullScreenButton.toggleIcon() });
  }

  private startMatch() {
    this._canvasOverlay.hide();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this._canvas.setOnTouchDownCallback((event) => this.onTouchDown(event));
    this._canvas.setOnTouchLiftCallback((event) => this.onTouchLift(event));
    this._lastTime = performance.now();
    this._animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private setReadyToPlay() {
    console.log('ready!');
    this._canvasOverlay.setWaitingState();
    this._canvasOverlay.onclick(() => null);
    this._socketClient.emitEvent('ready', this._token);
  }

  private getTouchCoord(touch: Touch): number {
    const canvasCssY = touch.clientY - this._canvas.boundingClientRect.top;

    return (canvasCssY - this._canvas.offsetY) / this._canvas.scale;
  }

  private handleTouch(yPos: number) {
    if (0 <= yPos && yPos <= VIEWPORT_HEIGHT / 2) {
      if (!this._inputs[0])
        this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: true })
      this._inputs[0] = true;
    } else {
      if (!this._inputs[1])
        this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: true })
      this._inputs[1] = true;
    }
  }

  private onTouchDown(event: TouchEvent) {
    event.preventDefault();

    const touch: Touch = event.touches[0];

    if (!touch) return ;

    const yTouch = this.getTouchCoord(touch);
    this.handleTouch(yTouch);
  }

  private onTouchLift(event: TouchEvent) {
    event.preventDefault();

    if (this._inputs[0])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: false })
    this._inputs[0] = false;

    if (this._inputs[1])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: false })
    this._inputs[1] = false;
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        if (!this._inputs[0])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: true })
        this._inputs[0] = true;
        break;
      case "s":
        if (!this._inputs[1])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: true })
        this._inputs[1] = true;
        break;
      default:
        break;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        if (this._inputs[0])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: false })
        this._inputs[0] = false;
        break;
      case "s":
        if (this._inputs[1])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: false })
        this._inputs[1] = false;
        break;
      default:
        break;
    }
  }

  private handleReady() {
    console.log('received ready from server');
  }

  private updateGame(data: Snapshot) {
    this._paddles[0].y = data.paddles[0].position;
    this._paddles[1].y = data.paddles[1].position;
    this._ball.setFromBallChange(data.ball);
  }

  private setEndState(score: number[]) {
    console.log(score);
    this._canvasOverlay.showMatchResult(score);
  }

  async refresh(token?: string) {
    this._token = token;
  }

  setPlayer(type: PlayerTypeValue) {
    console.log("new player", type);
  }

  private observeResize() {
    const canvasContainer = document.getElementById('matchCanvasContainer') as HTMLDivElement;
    const observer = new ResizeObserver(() => {
      this._canvas.resize();
      this._canvas.paintGameState(this._paddles, this._ball);
      this._canvasOverlay.resizeAdjustingTo(this._canvas);
      this._fullScreenButton.resizeAdjustingTo(this._canvas);
    });
    observer.observe(canvasContainer);
  }

  private gameLoop() {
    let now = performance.now();
    this._deltaTime = (now - this._lastTime) / 2;
    this._lastTime = now;
    this._canvas.paintGameState(this._paddles, this._ball);
    this._ball.updatePosition(this._deltaTime);
    this._animationId = requestAnimationFrame(() => this.gameLoop());
  }

  async destroy(): Promise<void> {
    this._socketClient.disconnect();
    if (this._animationId)
      cancelAnimationFrame(this._animationId);
    this._animationId = 0;
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    await super.destroy();
  }
}
