import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type { NewTournamentRequest } from "../models/NewTournamentRequest";

export class NewTournamentService {
  private static readonly ENDPOINT = "/tournament";
  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  newTournament(request: NewTournamentRequest): Promise<{token: string}> {
    return this._apiClient.post(NewTournamentService.ENDPOINT, request);
  }

}