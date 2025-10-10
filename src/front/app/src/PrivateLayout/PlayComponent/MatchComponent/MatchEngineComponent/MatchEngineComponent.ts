import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import { io, Socket } from "socket.io-client";
import type { PlayerTypeValue } from "../MatchComponent";

export type MatchEngineEvents = {
  opponentConnected: number;
};

export default class MatchEngineComponent extends AmethComponent<MatchEngineEvents> {
  template = () => import("./MatchEngineComponent.html?raw");
  private _token?: string;
  private _socket: Socket | null;

  constructor(token?: string) {
    super();
    this._token = token;
    this._socket = null;
  }

  async init(selector: string, router?: Router): Promise<void> {
    await super.init(selector, router);

    this._socket = io("https://localhost:8081", {
      withCredentials: true,
    });  
  }

  afterInit() {
    // this.outlet!.innerHTML = this._token as string;
    this._socket?.on("connect", () => {
      console.log("Connected:", this._socket?.id, this._socket?.connected);
      this._socket?.emit("joinMatch", this._token);
    });
    this._socket?.on("handshake", (data) => {
      console.log("Handshake:", data);
      this.emit("opponentConnected", data);
    });
    this._socket?.on("message", (data) => {
      console.log("Message:", data);
    });
    this._socket?.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });
    document.getElementById("test-btn")!.onclick = () => {
      this._socket?.emit("ready", this._token);
    };
    document.getElementById("title")!.innerHTML = "ENGINE: " + (this._token as string);
  }

  async refresh(token?: string) {
    this._token = token;
    // this.outlet!.innerHTML = this._token as string;
    document.getElementById("title")!.innerHTML = "ENGINE: " + (this._token as string);
  }

  setPlayer(type: PlayerTypeValue) {
    console.log("new player", type);
  }

  async destroy(): Promise<void> {
    if (this._socket) {
      this._socket.disconnect();
      this._socket = null;
    }
    super.destroy();
  }
}
