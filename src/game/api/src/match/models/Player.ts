import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { PlayerState } from "./States";

export class Player {
  private _id: string;
  private _username: string;
  private _state: PlayerState;

  constructor(socket: AuthenticatedSocket) {
    this._id = socket.id;
    this._username = socket.username || "";
    this._state = "IDLE";
  }

  public get id() : string {
    return this._id
  }
  
  public get username() : string {
    return this._username
  }
  
  public get state() : string {
    return this._state
  }
  
  public set state(newState : PlayerState) {
    this._state = newState;
  }  
}