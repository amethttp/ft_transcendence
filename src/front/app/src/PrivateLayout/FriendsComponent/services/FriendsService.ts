import { ApiClient } from "../../../ApiClient/ApiClient";

export class FriendsService {
  private static readonly BASE = "/friends";
  private static readonly LIST_ENDPOINT = "";
  private _api: ApiClient;

  constructor() {
    this._api = new ApiClient();
  }
}