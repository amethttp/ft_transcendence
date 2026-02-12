import Alert from "../../framework/Alert/Alert";
import AmethComponent from "../../framework/AmethComponent"
import type { Router } from "../../framework/Router/Router";
import { TitleHelper } from "../../framework/TitleHelper/TitleHelper";
import { SearchHelper } from "./helpers/SearchHelper";
import type { SearchResult } from "./models/SearchResult";
import SearchUsersListComponent from "./SearchUsersListComponent/SearchUsersListComponent";
import { SearchService } from "./services/SearchService";

export default class SearchComponent extends AmethComponent {
  template = () => import("./SearchComponent.html?raw");
  private _query: string | null;
  private _results: SearchResult;
  private _searchService: SearchService;
  private _usersList: SearchUsersListComponent;
  private _container!: HTMLElement;

  constructor() {
    super();
    this._results = {};
    this._query = null;
    this._searchService = new SearchService();
    this._usersList = new SearchUsersListComponent();
  }

  async init(selector: string, router?: Router) {
    await super.init(selector, router);
    this._setQuery();
    await this._getResults();
  }

  private async _getResults() {
    this._results = {};
    if (this._query) {
      try {
        this._results = await this._searchService.getResults(this._query);
      } catch (error: any) {
        Alert.error("Some error occurred", error["error"]); // TODO: Quitar el mensaje
      }
    }
  }

  private _setQuery() {
    this._query = SearchHelper.getQuery();
  }

  async afterInit() {
    if (this._query)
      document.title = TitleHelper.addTitlePart(this._query, document.title);
    this._container = document.getElementById("SearchComponentContainer")!;
    await this._usersList.init("SearchUserList", this.router);
    await this._usersList.afterInit();
    this._fillResultsView();
  }

  async refresh() {
    super.refresh();
    this._setQuery();
    if (this._query)
      document.title = TitleHelper.addTitlePart(this._query, document.title);
    await this._getResults();
    this._fillResultsView();
  }

  private _fillResultsView() {
    const resultKeys = Object.keys(this._results);
    this._usersList.fillView(this._results.users || []);
    if (resultKeys.length > 0) {
      let amount = 0;
      for (const array of Object.values(this._results))
        amount += array.length;
      this._container.innerHTML = `Found <b>${amount}</b> results.`;
    }
    else {
      this._clearView();
      if (!this._query) {
        this._container.innerHTML = `Type anything on search field and we'll probably find it!`;
      }
      else {
        this._container.innerHTML = `"${this._query}" not found.`;
      }
    }
  }

  private _clearView() {
    this._usersList.fillView([]);
  }
}
