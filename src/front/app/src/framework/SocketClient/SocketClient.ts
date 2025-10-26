import { io, Socket } from "socket.io-client";

export default class SocketClient {
  private _socket: Socket;

  constructor(uri: string) {
    this._socket = io(uri, {
      withCredentials: true,
    });
  }

  get id(): string | undefined {
    return this._socket.id;
  }

  get connected(): boolean {
    return this._socket.connected;
  }

  public setEvent(event: string, cb: (...args: any[]) => void) {
    this._socket.on(event, cb);
  }

  public emitEvent(event: string, ...args: any[]) {
    this._socket.emit(event, ...args);
  }

  public disconnect() {
    this._socket.disconnect();
  }
}
