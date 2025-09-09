import { ApiClient } from "../../../../../ApiClient/ApiClient";
import type { BasicResponse } from "../../../../../auth/models/BasicResponse";

export class RegisterService {
  private static readonly BASE = "/user/check";
  private static readonly USERNAME_ENDPOINT = this.BASE + "/username";
  private static readonly EMAIL_ENDPOINT = this.BASE + "/email";

  private _api: ApiClient;

  constructor() {
    this._api = new ApiClient();
  }

  usernameExists(username: string): Promise<BasicResponse> {
    return this._api.get<BasicResponse>(`${RegisterService.USERNAME_ENDPOINT}/${username}`);
  }

  emailExists(email: string): Promise<BasicResponse> {
    return this._api.get<BasicResponse>(`${RegisterService.EMAIL_ENDPOINT}/${email}`);
  }
}
