import { ApiClient } from "../../../ApiClient/ApiClient";
import type { Friends } from "../UserFriends/UserFriends";

export class FriendsService {
  private static readonly BASE = "/relation";
  private static readonly FRIENDS_ENDPOINT = this.BASE + "/friends";
  private static readonly REQUESTS_ENDPOINT = this.BASE + "/requests";
  private static readonly BLOCKED_ENDPOINT = this.BASE + "/blocked";
  private _api: ApiClient;

  constructor() {
    this._api = new ApiClient();
  }

  getAll(): Promise<Friends> {
    return this._api.get(FriendsService.FRIENDS_ENDPOINT);
  }

  getRequests(): Promise<Friends> {
    return this._api.get(FriendsService.REQUESTS_ENDPOINT);
  }

  getBlocked(): Promise<Friends> {
    return this._api.get(FriendsService.BLOCKED_ENDPOINT);
  }
}