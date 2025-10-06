import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import { io, Socket } from "socket.io-client";

export type MatchEngineEvents = {
  newPlayer: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socket: Socket | null;
  private _canvas!: HTMLCanvasElement;

  constructor(token?: string) {
    super();
    this._token = token;
    this._socket = null;
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._socket = io("https://localhost:8081")
  }

  afterInit() {
    // Stone-200 oklch(92.3% 0.003 48.717)
    // this.outlet!.innerHTML = this._token as string;
    this._socket?.on("connect", () => {
      console.log("Connected:", this._socket?.id, this._socket?.connected);
      this._socket?.emit("joinMatch", this._token);
    });
    this._socket?.on("handshake", (data) => {
      console.log("Handshake:", data);
      this.emit('newPlayer', data);
    });
    this._socket?.on("message", (data) => {
      console.log("Message:", data);
    });
    this._socket?.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });
    document.getElementById("test-btn")!.onclick = () => {
      this._socket?.emit("helloWorld", this._token);
    };
    document.getElementById("title")!.innerHTML = "ENGINE: " + (this._token as string);
    this._canvas = document.getElementById('matchCanvas') as HTMLCanvasElement;
  }

  async refresh(token?: string) {
    this._token = token;
    // this.outlet!.innerHTML = this._token as string;
    document.getElementById("title")!.innerHTML = "ENGINE: " + (this._token as string);
  }

  async destroy(): Promise<void> {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
    super.destroy();
  }
}
