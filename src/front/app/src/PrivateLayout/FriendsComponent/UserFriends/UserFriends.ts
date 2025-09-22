import EventEmitter from "../../../framework/EventEmitter/EventEmitter";
import type UserProfile from "../../UserComponent/models/UserProfile";
import { FriendsService } from "../services/FriendsService";

export type Friends = UserProfile[];

export type FriendsEvents = {
  status: Record<number, boolean>,
  profile: Friends
}

export class UserFriends extends EventEmitter<FriendsEvents> {
  private _friends: Friends | undefined;
  private profilePooling?: number;
  // private static connectedPooling;

  constructor() {
    super();
    this.startPoolings();
  }

  startPoolings() {
    this.profilePooling = setInterval(() => {
      this.get(true);
    }, 2000);
  }

  async get(force = false): Promise<Friends> {
    if (force || this._friends === undefined) {
      try {
        this._friends = await (new FriendsService().getAll());
        console.log("Friends", this._friends);
        super.emit("profile", this._friends);
        return this._friends;
      } catch (error) {
        console.warn(error);
        return [];
      }
    }
    else
      return this._friends;
  }

  destroy() {
    clearInterval(this.profilePooling);
  }
}