import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type { MatchJoinResponse } from "../models/MatchJoinResponse";

export class MatchService {
  private static readonly BASE_ENDPOINT = "/join-match";

  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getJoinMatch(token: string): Promise<MatchJoinResponse> {
    return this._apiClient.get(`${MatchService.BASE_ENDPOINT}/${token}`);
  }
}