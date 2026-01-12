import { AuthenticatedSocket } from "./AuthenticatedSocket";
import { Player } from "./Player";
import { PlayerState, TPlayerState } from "./PlayerState";

export class HumanPlayer extends Player {
  constructor(socket: AuthenticatedSocket) {
    super();
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