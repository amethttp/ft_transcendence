import { ApiClient } from "../../ApiClient/ApiClient";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import type { FriendsStatus } from "../models/FriendsStatus";

export class StatusService {
  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  refreshStatus() {
    this._apiClient.post('/status/refresh')
      .catch(err => console.warn(err));
  }

  getFriendsStatus(): Promise<FriendsStatus> {
    return this._apiClient.get('/status/friends');
  }
}
