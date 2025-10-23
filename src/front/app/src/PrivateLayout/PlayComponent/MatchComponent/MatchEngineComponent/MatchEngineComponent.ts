import AmethComponent from "../../../../framework/AmethComponent";
import type { Router } from "../../../../framework/Router/Router";
import { io, Socket } from "socket.io-client";
import type { PlayerTypeValue } from "../MatchComponent";
import type { Snapshot } from "./models/Snapshot";

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
    this._socket?.on("ready", () => {
      this.setPlayerReady();
    });
    this._socket?.on("snapshot", (data) => {
      this.updateGame(data);
    });
    this._socket?.on("end", (data) => {
      this.setEndState(data);
    });
    this._socket?.on("disconnect", (reason) => {
      console.log("Disconnected:", reason);
    });
  }

  afterInit() {
    const btn = document.getElementById("test-btn");
    if (btn) {
      btn.style.position = "absolute";
      btn.onclick = () => {
        this._socket?.emit("ready", this._token);
      };
    }
    document.getElementById("title")!.innerHTML = "ENGINE: " + (this._token as string);
    window.addEventListener("keydown", this.handleKeyDown);
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
    window.removeEventListener("keydown", this.handleKeyDown);
    await super.destroy();
  }
}
