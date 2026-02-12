import EventEmitter from "../../../framework/EventEmitter/EventEmitter";
import type UserProfile from "../../UserComponent/models/UserProfile";
import type { FriendsStatus } from "../../models/FriendsStatus";
import { StatusService } from "../../services/StatusService";
import { FriendsService } from "../services/FriendsService";

export type Friends = UserProfile[];

export type FriendsEvents = {
  status: FriendsStatus,
  profile: Friends
}

export class UserFriends extends EventEmitter<FriendsEvents> {
  private _friendsService: FriendsService;
  private _statusService: StatusService;
  private _friends: Friends | undefined;
  private _statusPolling?: number;

  constructor() {
    super();
    this._friendsService = new FriendsService();
    this._statusService = new StatusService();
    this.startPollings();
  }

  startPollings() {
    if (!this._statusPolling) {
      this._statusPolling = setInterval(this.getStatuses.bind(this), 20000);
    }
  }

  stopPollings() {
    if (this._statusPolling) {
      clearInterval(this._statusPolling);
      this._statusPolling = undefined;
    }
  }

  async getStatuses() {
    try {
      const friendsStatus = await this._statusService.getFriendsStatus();
      this.emit("status", friendsStatus);
    } catch (error) {
      console.warn(error);
    }
  }

  async get(force = false): Promise<Friends> {
    if (force || this._friends === undefined) {
      try {
        this._friends = await (this._friendsService.getAll());
        this.emit("profile", structuredClone(this._friends));
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
    this.stopPollings();
  }
}
