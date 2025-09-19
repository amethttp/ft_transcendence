
import { ApiClient } from "../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../framework/HttpClient/IHttpClient";
import type User from "../../../auth/models/User";

export default class UserProfileService {
  private static readonly BASE = "/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  getUserProfile(username: string): Promise<User> {
    return this.http.get(UserProfileService.PROFILE_ENDPOINT + username);
  }
}