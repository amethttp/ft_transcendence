import { PlayerState } from "./States";

export class Player {
  private _username: string;
  private _state: PlayerState;

  constructor(username: string) {
    this._username = username;
    this._state = "IDLE";
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