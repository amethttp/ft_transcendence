import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import SocketClient from "../../../../framework/SocketClient/SocketClient";
import { PlayerType } from "../MatchComponent";
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
  opponentLeft: boolean;
  matchEnded: number[];
};

export default class MatchEngineComponent extends AmethComponent<any, MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: Canvas;
  private _canvasOverlay!: CanvasOverlay;
  private _fullScreenButton!: FullScreenButton;
  private _paddles: Paddle[] = [];
  private _inputs: boolean[] = [false, false, false, false];
  private _ball: Ball;
  private _score: number[] = [0, 0];
  private _animationId: number = 0;
  private _lastTime: number = 0;
  private _deltaTime: number = 0;
  private _resizeObserver?: ResizeObserver;
  private _fullscreenChangeHandler?: () => void;
  private _activeMatch?: boolean;

  constructor(token?: string) {
    super();
    this._activeMatch = false;
    this._token = token;
    this._paddles[0] = new Paddle(100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._paddles[1] = new Paddle(VIEWPORT_WIDTH - Paddle.width - 100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._ball = new Ball(VIEWPORT_WIDTH / 2 - Ball.size / 2, VIEWPORT_HEIGHT / 2 - Ball.size / 2);
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._socketClient = new SocketClient(import.meta.env.VITE_GAME_API_URL);
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
      this.setPaddlesFromChanges(paddles);
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
    this._socketClient.setEvent('opponentLeft', () => {
      this.emit("opponentLeft", true);
    });
    this._socketClient.setEvent('pause', () => {
      this._canvasOverlay.setPauseState();
      if (this._animationId)
        cancelAnimationFrame(this._animationId);
      this._animationId = 0;
    });
    this._socketClient.setEvent('reset', () => {
      this._unLockNavigation();
      this._canvasOverlay.reset();
      this._canvasOverlay.onclick(() => this.setReadyToPlay());
    });
  }

  afterInit() {
    this._canvas = new Canvas();
    this._canvasOverlay = new CanvasOverlay();
    this._canvasOverlay.onclick(() => this.setReadyToPlay());
    this._fullScreenButton = new FullScreenButton();
    this._fullScreenButton.onclick(() => this._canvas.toggleFullScreen());
    this.observeResize();
    this._fullscreenChangeHandler = () => {
      this._canvas.toggleFullScreenStyles();
      this._fullScreenButton.toggleIcon();
    };
    document.addEventListener('fullscreenchange', this._fullscreenChangeHandler);
    window.addEventListener('beforeunload', this.beforeUnloadHandler);
  }

  private beforeUnloadHandler = (event: BeforeUnloadEvent) => {
    if (this._activeMatch) {
      event.preventDefault();
      event.returnValue = '';
    }
  }

  private _lockNavigation() {
    this.router?.preventUnload("You have an active match. Are you sure you want to leave?");
    this._activeMatch = true;
  }

  private _unLockNavigation() {
    this.router?.permitUnload();
    this._activeMatch = false;
  }

  private startMatch() {
    this._canvasOverlay.hide();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this._canvas.setOnTouchDownCallback((event) => this.onTouchDown(event));
    this._canvas.setOnTouchLiftCallback((event) => this.onTouchLift(event));
    this._lastTime = performance.now();
    this._animationId = this.requestAnimationFrame(() => this.gameLoop());
  }

  private setReadyToPlay() {
    console.log('ready!');
    this._lockNavigation();
    this._canvasOverlay.setWaitingState();
    this._canvasOverlay.onclick(() => null);
    this._socketClient.emitEvent('ready', this._token);
  }

  private getTouchCoordX(touch: Touch): number {
    const canvasCssX = touch.clientX - this._canvas.boundingClientRect.left;

    return (canvasCssX - this._canvas.offsetX) / this._canvas.scale;
  }

  private getTouchCoordY(touch: Touch): number {
    const canvasCssY = touch.clientY - this._canvas.boundingClientRect.top;

    return (canvasCssY - this._canvas.offsetY) / this._canvas.scale;
  }

  private handleTouch(xPos: number, yPos: number) {
    if (xPos <= VIEWPORT_WIDTH / 2) {
      if (0 <= yPos && yPos <= VIEWPORT_HEIGHT / 2) {
        if (!this._inputs[0])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: true })
        this._inputs[0] = true;
      } else {
        if (!this._inputs[1])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: true })
        this._inputs[1] = true;
      }
    } else {
      if (0 <= yPos && yPos <= VIEWPORT_HEIGHT / 2) {
        if (!this._inputs[2])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowUp', isPressed: true })
        this._inputs[2] = true;
        } else {
        if (!this._inputs[3])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowDown', isPressed: true })
        this._inputs[3] = true;
        }
    }
  }

  private onTouchDown(event: TouchEvent) {
    event.preventDefault();

    const touch: Touch = event.touches[0];

    if (!touch) return ;

    const xTouch = this.getTouchCoordX(touch);
    const yTouch = this.getTouchCoordY(touch);

    this.handleTouch(xTouch, yTouch);
  }

  private onTouchLift(event: TouchEvent) {
    event.preventDefault();

    if (this._inputs[0])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'w', isPressed: false })
    this._inputs[0] = false;

    if (this._inputs[1])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 's', isPressed: false })
    this._inputs[1] = false;

    if (this._inputs[2])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowUp', isPressed: false });
    this._inputs[2] = false;

    if (this._inputs[3])
      this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowDown', isPressed: false });
    this._inputs[3] = false;
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
      case "ArrowUp":
        if (!this._inputs[2])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowUp', isPressed: true })
        this._inputs[2] = true;
        break;
      case "ArrowDown":
        if (!this._inputs[3])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowDown', isPressed: true })
        this._inputs[3] = true;
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
      case "ArrowUp":
        if (this._inputs[2])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowUp', isPressed: false })
        this._inputs[2] = false;
        break;
      case "ArrowDown":
        if (this._inputs[3])
          this._socketClient.emitEvent('paddleChange', { token: this._token, key: 'ArrowDown', isPressed: false })
        this._inputs[3] = false;
        break;
      default:
        break;
    }
  }

  private handleReady() {
    console.log('received ready from server');
  }

  private setPaddlesFromChanges(paddles: Snapshot["paddles"]) {
    for (const paddle of paddles) {
      if (paddle.side === 0) {
        this._paddles[0].y = paddle.position;
      } else if (paddle.side === 1) {
        this._paddles[1].y = paddle.position;
      }
    }
  }

  private updateGame(data: Snapshot) {
    this.setPaddlesFromChanges(data.paddles);
    this._ball.setFromBallChange(data.ball);
    this._score = data.score;
  }

  private setEndState(score: number[]) {
    this._canvasOverlay.disable();
    this._canvasOverlay.showMatchResult(score);
    this._unLockNavigation();
    this.emit('matchEnded', score);
  }

  async refresh(token?: string) {
    this._token = token;
  }

  setPlayer(type: PlayerTypeValue) {
    console.log("new player", type);
    if (type === PlayerType.CPU)
      this._socketClient.emitEvent('ai', this._token);
    else if (type === PlayerType.LOCAL)
      this._socketClient.emitEvent('local', this._token);
  }

  private observeResize() {
    const canvasContainer = document.getElementById('matchCanvasContainer') as HTMLDivElement;
    this._resizeObserver = new ResizeObserver((_entries) => {
      this._canvas.resize();
      this._canvas.paintGameState(this._paddles, this._ball, this._score);
      this._canvasOverlay.resizeAdjustingTo(this._canvas);
      this._fullScreenButton.resizeAdjustingTo(this._canvas);
    });
    this._resizeObserver.observe(canvasContainer);
  }

  private gameLoop() {
    let now = performance.now();
    this._deltaTime = (now - this._lastTime) / 2;
    this._lastTime = now;
    this._canvas.paintGameState(this._paddles, this._ball, this._score);
    this._ball.updatePosition(this._deltaTime);
    this._animationId = this.requestAnimationFrame(() => this.gameLoop());
  }

  async destroy(): Promise<void> {
    this._socketClient.disconnect();
    if (this._animationId)
      cancelAnimationFrame(this._animationId);
    this._animationId = 0;
    this._resizeObserver?.disconnect();
    if (this._fullscreenChangeHandler)
      document.removeEventListener('fullscreenchange', this._fullscreenChangeHandler);
    window.removeEventListener('keydown', this.handleKeyDown);
    window.removeEventListener('keyup', this.handleKeyUp);
    window.removeEventListener('beforeunload', this.beforeUnloadHandler);
    this.router?.permitUnload();
    await super.destroy();
  }
}
