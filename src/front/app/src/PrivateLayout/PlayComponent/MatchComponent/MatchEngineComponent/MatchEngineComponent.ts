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

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: Canvas;
  private _canvasOverlay!: CanvasOverlay;
  private _paddles: Paddle[] = [];
  private _inputs: boolean[] = [false, false];
  private _ball: Ball;
  private _animationId: number = 0;

  constructor(token?: string) {
    super();
    this._token = token;
    this._paddles[0] = new Paddle(100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._paddles[1] = new Paddle(VIEWPORT_WIDTH - Paddle.width - 100, VIEWPORT_HEIGHT / 2 - Paddle.height / 2);
    this._ball = new Ball(VIEWPORT_WIDTH / 2 - Ball.size / 2, VIEWPORT_HEIGHT / 2 - Ball.size / 2);
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

      // TODO: Change for 'start' event
      if (data === 'Players are ready! || Starting Match in 3...')
        this.startMatch();
    });
    this._socketClient.setEvent("ready", () => {
      this.handleReady();
    });
    this._socketClient.setEvent("snapshot", (data) => {
      this.updateGame(data);
    });
    this._socketClient.setEvent("ballChange", (data) => {
      console.log(data);
      this._ball.x = data.position.x;
      this._ball.y = data.position.y;
      this._ball.dirX = data.direction.x;
      this._ball.dirY = data.direction.y;
      this._ball.velocity = data.velocity;
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
    this.observeResize();
  }

  private startMatch() {
    this._canvasOverlay.hide();
    window.addEventListener('keydown', this.handleKeyDown);
    window.addEventListener('keyup', this.handleKeyUp);
    this._animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private setReadyToPlay() {
    console.log('ready!');
    this._canvasOverlay.setWaitingState();
    this._canvasOverlay.onclick(() => null);
    this._socketClient.emitEvent('ready', this._token);
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        this._inputs[0] = true;
        break;
      case "s":
        this._inputs[1] = true;
        break;
      default:
        break;
    }
  };

  private handleKeyUp = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        this._inputs[0] = false;
        break;
      case "s":
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
    console.log(data);
    this._paddles[0].y = data.paddles[0].position;
    this._paddles[1].y = data.paddles[1].position;
    this._ball.x = data.ball.position.x;
    this._ball.y = data.ball.position.y;
    this._ball.dirX = data.ball.direction.x;
    this._ball.dirY = data.ball.direction.y;
    this._ball.velocity = data.ball.velocity;
  }

  private setEndState(score: number[]) {
    console.log(score);
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
    });
    observer.observe(canvasContainer);
  }

  private gameLoop() {
    this._canvas.paintGameState(this._paddles, this._ball);
    if (this._inputs[0] && !this._inputs[1])
      this._socketClient.emitEvent("paddleChange", { token: this._token, key: 'w' });
    else if (this._inputs[1] && !this._inputs[0])
      this._socketClient.emitEvent("paddleChange", { token: this._token, key: 's' });

    this._ball.x = this._ball.dirX + this._ball.velocity;
    this._ball.y = this._ball.dirY + this._ball.velocity;
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
