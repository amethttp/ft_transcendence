import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type { NewMatchRequest } from "../models/NewMatchRequest";

export class NewMatchService {
  private static readonly ENDPOINT = "/match";
  private _apiClient: IHttpClient;

  constructor() {
    this._apiClient = new ApiClient();
  }

  newMatch(request: NewMatchRequest): Promise<{token: string}> {
    return this._apiClient.post(NewMatchService.ENDPOINT, request);
  }

}