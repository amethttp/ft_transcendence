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
      // console.log("Snapshot:", performance.now(), data);
      this.updateButtonPosition(data[0]);
    });
    this._socket?.on("end", (data) => {
      console.log("End:", performance.now(), data);
      this.setEndState(data[0]);
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
  }

  private setPlayerReady() {
    const btn = document.getElementById("test-btn");
    if (!btn) return;

    btn.classList.remove("bg-red-400");
    btn.classList.add("bg-green-400");
    btn.innerText = "Ready!";
  }

  private updateButtonPosition(data: Snapshot) {
    const btn = document.getElementById("test-btn");
    const title = document.getElementById("title");
    if (!btn || !title) return;

    btn.style.transform = `translate(${data.ball.position.x}px, ${data.ball.position.y}px)`;
    title.innerText = `${data.score[0]} / ${data.score[1]}`;
  }

  private setEndState(data: Snapshot) {
    const title = document.getElementById("title");
    if (!title) return;

    title.innerText = `GAME FINISHED || ${data.score[0]} / ${data.score[1]}`;
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
    await super.destroy();
  }
}
