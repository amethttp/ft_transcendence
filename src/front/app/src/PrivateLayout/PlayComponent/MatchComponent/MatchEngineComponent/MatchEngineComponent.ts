import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import SocketClient from "../../../../framework/SocketClient/SocketClient";
import type { PlayerTypeValue } from "../MatchComponent";
import Ball from "./Elements/Ball";
import Paddle from "./Elements/Paddle";
import Canvas from "./Elements/Canvas";
import { VIEWPORT_HEIGHT, VIEWPORT_WIDTH } from "./Elements/Viewport";
import type { Snapshot } from "./models/Snapshot";

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: Canvas;
  private _paddles: Paddle[] = [];
  private _ball: Ball;

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
    });
    this._socketClient.setEvent("ready", () => {
      this.setPlayerReady();
    });
    this._socketClient.setEvent("snapshot", (data) => {
      this.updateGame(data);
    });
    this._socketClient.setEvent("end", (data) => {
      this.setEndState(data);
    });
    this._socketClient.setEvent('disconnect', (reason) => {
      console.log("Disconnected:", reason);
    });
  }

  // CANVAS ON CLICK         this._socket?.emit("ready", this._token);
  // window.addEventListener("keydown", this.handleKeyDown);

  afterInit() {
    this._canvas = new Canvas();
    this.observeResize();
  }

  private handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case "w":
        this._socket?.emit("paddleChange", { token: this._token, key: event.key });
        break;
      case "s":
        this._socket?.emit("paddleChange", { token: this._token, key: event.key });
        break;

      default:
        break;
    }
  };

  private setPlayerReady() {
  }

  private updateGame(data: Snapshot) {
    console.log(data);
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
    });
    observer.observe(canvasContainer);
  }

  async destroy(): Promise<void> {
    this._socketClient.disconnect();
    await super.destroy();
  }
}
