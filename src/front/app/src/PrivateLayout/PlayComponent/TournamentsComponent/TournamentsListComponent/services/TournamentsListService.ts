import { ApiClient } from "../../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../../framework/HttpClient/IHttpClient";
import type { TournamentMinified } from "../models/TournamentMinified";

export class TournamentsListService {
  private static readonly ENDPOINT = "/tournament/list";
  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getList(): Promise<TournamentMinified[]> {
    return this._apiClient.get(TournamentsListService.ENDPOINT);
  }
}