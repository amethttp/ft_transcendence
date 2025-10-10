import { ApiClient } from "../../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../../framework/HttpClient/IHttpClient";
import type { MatchMinified } from "../models/MatchMinified";

export class MatchListService {
  private static readonly BASE_ENDPOINT = "/match/list";

  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getMatches(): Promise<MatchMinified[]> {
    return this._apiClient.get(MatchListService.BASE_ENDPOINT);
  }
}