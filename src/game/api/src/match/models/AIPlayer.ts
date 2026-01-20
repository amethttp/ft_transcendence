import { Player } from "./Player";
import { PlayerState, TPlayerState } from "./PlayerState";

export class AIPlayer extends Player {
  constructor() {
    super();
    this._id = "AI";
    this._username = "Durandal";
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