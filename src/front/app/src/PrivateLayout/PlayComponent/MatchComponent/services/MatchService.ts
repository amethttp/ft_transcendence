import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type { MatchJoin } from "../models/MatchJoin";
import type { MatchPlayer } from "../models/MatchPlayer";

export class MatchService {
  private static readonly BASE_ENDPOINT = "/match";
  private static readonly JOIN_ENDPOINT = "/join";
  private static readonly PLAYER_ENDPOINT = this.BASE_ENDPOINT + "/player";

  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getJoinMatch(token: string): Promise<MatchJoin> {
    return this._apiClient.get(`${MatchService.BASE_ENDPOINT}/${token}${MatchService.JOIN_ENDPOINT}`);
  }

  getPlayer(id: number): Promise<MatchPlayer> {
    return this._apiClient.get(`${MatchService.PLAYER_ENDPOINT}/${id}`);
  }
}