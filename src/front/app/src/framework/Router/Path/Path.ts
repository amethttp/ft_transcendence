type Param = string | number | boolean | undefined;

export default class Path {
  private _pathName: string;
  private _params: Map<string, Param>;

  constructor(pathName?: string) {
    this._pathName = pathName || "";
    this._params = new Map();
  }

  get pathName() {
    return this._pathName;
  }

  get params(): Map<string, Param> {
    return this._params;
  }
}