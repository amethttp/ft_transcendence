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

    this.prepareCanvas();
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

  private prepareCanvas() {
    let color = 'oklch(97% 0.001 106.424)';
    let paddleWidth = 2;
    let paddleHeight = 20;

    let paddle1 = {
        x : 10,
        y : this._canvas.height/2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        velocityY : 0
    }

    let paddle2 = {
        x : this._canvas.width - paddleWidth - 10,
        y : this._canvas.height/2 - paddleHeight / 2,
        width: paddleWidth,
        height: paddleHeight,
        velocityY : 0
    }

    //ball
    let ballDimension = 2;
    let ball = {
        x : this._canvas.width/2 - ballDimension / 2,
        y : this._canvas.height/2 - ballDimension / 2,
        width: ballDimension,
        height: ballDimension,
        velocityX : 1,
        velocityY : 2
    }

    this._canvasContext.fillStyle = color;
    this._canvasContext.fillRect(paddle1.x, paddle1.y, paddle1.width, paddle1.height);
    this._canvasContext.fillRect(paddle2.x, paddle2.y, paddle2.width, paddle2.height);
    this._canvasContext.fillRect(ball.x, ball.y, ball.width, ball.height);

    // BUG WITH requestPrepareAnimation(this.update) DOESNT WORK WITH "this", this is undefined
  }

  private update() {
    this._canvasContext.clearRect(0, 0, this._canvas.width, this._canvas.height);
    this._canvasContext.fillStyle = "oklch(97% 0.001 106.424)";
    this._canvasContext.fillRect(0, 0, this._canvas.width, this._canvas.height);
  }
}
