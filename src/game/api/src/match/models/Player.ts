import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { PlayerState, TPlayerState } from "./PlayerState";

export class Player {
  private _id: string;
  private _username: string;
  private _state: TPlayerState;

  constructor(socket: AuthenticatedSocket) {
    this._id = socket.id;
    this._username = socket.username || "";
    this._state = PlayerState.WAITING;
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
  
  public set state(newState : TPlayerState) {
    this._state = newState;
  }  
}