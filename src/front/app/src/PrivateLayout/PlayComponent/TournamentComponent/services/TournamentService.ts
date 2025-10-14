import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { Tournament } from "../models/Tournament";

export class TournamentService {
  private static readonly BASE_ENDPOINT = "/tournament";
  private _apiClient: ApiClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  getByToken(token: string): Promise<Tournament> {
    return this._apiClient.get(`${TournamentService.BASE_ENDPOINT}/${token}`);
  }
}