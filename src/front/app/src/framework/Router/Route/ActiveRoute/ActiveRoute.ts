import type { Route } from "../Route";

export default class ActiveRoute {
  private _route: Route;
  private _next?: ActiveRoute;
  private _prev?: ActiveRoute;

  constructor(route: Route) {
    this._route = route;
  }

  get route(): Route {
    return this._route;
  }

  get next(): ActiveRoute | undefined {
    return this._next;
  }

  get prev(): ActiveRoute | undefined {
    return this._prev;
  }

  set route(route: Route) {
    this._route = route;
  }

  set next(next: ActiveRoute | undefined) {
    this._next = next;
  }

  set prev(prev: ActiveRoute | undefined) {
    this._prev = prev;
  }
}
