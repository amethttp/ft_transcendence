import { Player } from "./Player";
import { PlayerState, TPlayerState } from "./PlayerState";

export class LocalPlayer extends Player {
  constructor() {
    super();
    this._id = "LOCAL";
    this._username = "Player 2";
    this._state = PlayerState.READY;
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