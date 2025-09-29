import { Context } from "../../../framework/Context/Context";

export class SearchHelper {
  static getQuery(): string | null {
    let query;
    const search = new URLSearchParams(location.search).get("q");
    const param = Context.router.currentPath.params["query"];
    if (search)
      query = search;
    else if (param)
      query = param as string;
    else
      query = null;
    return query?.trim() || null;
  }
}