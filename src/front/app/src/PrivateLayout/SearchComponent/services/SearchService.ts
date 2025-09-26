import { ApiClient } from "../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../framework/HttpClient/IHttpClient";
import type { SearchResult } from "../models/SearchResult";

export class SearchService {
  static readonly SEARCH_ENDPOINT = "/search";
  private _api: IHttpClient;

  constructor() {
    this._api = new ApiClient();
  }

  getResults(query: string): Promise<SearchResult> {
    return this._api.get(SearchService.SEARCH_ENDPOINT + `?q=${query}`);
  }
}