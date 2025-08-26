export type PathParam = string | number;

export default class Path {
  private _fullPath: string;
  private _routePath: string;
  private _params: Record<string, PathParam>;

  constructor(fullPath: string = "", routePath: string = "", params: Record<string, PathParam> = {}) {
    this._fullPath = fullPath;
    this._routePath = routePath;
    this._params = params;
  }

  get fullPath(): string {
    return this._fullPath;
  }

  get routePath(): string {
    return this._routePath;
  }

  get params(): Record<string, PathParam> {
    return this._params;
  }

  set fullPath(fullPath: string) {
    this._fullPath = fullPath;
  }

  set routePath(routePath: string) {
    this._routePath = routePath;
  }

  set params(params: Record<string, PathParam>) {
    this._params = params;
  }
}
