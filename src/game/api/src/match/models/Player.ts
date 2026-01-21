import { PlayerState, TPlayerState } from "./PlayerState";

export abstract class Player {
  protected _id: string;
  protected _username: string;
  protected _state: TPlayerState;

  protected constructor() {
    this._id = "DefaultID";
    this._username = "DefaultUsername";
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

  toDto() {
    return {
      id: this._id,
      username: this._username,
      state: this._state
    };
  }
}