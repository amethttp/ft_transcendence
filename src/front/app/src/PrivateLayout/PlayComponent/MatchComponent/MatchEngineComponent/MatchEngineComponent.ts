import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import SocketClient from "../../../../framework/SocketClient/SocketClient";
import type { PlayerTypeValue } from "../MatchComponent";
import Canvas from "./Elements/Canvas";

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socketClient!: SocketClient;
  private _canvas!: Canvas;

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
    this._canvas = new Canvas();

    this._canvas.resize();
    this._canvas.showInitialState();
    this.observeResize();
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
      this._canvas.showInitialState();
    });
    observer.observe(canvasContainer);
  }

  async destroy(): Promise<void> {
    this._socketClient.disconnect();
    super.destroy();
  }
}
