import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type User from "../models/User";

export default class UserProfileService {
  private static readonly BASE = "/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  getUserProfile(userName: string): Promise<User> {
      return this.http.get(UserProfileService.PROFILE_ENDPOINT + userName);
  }

  getLoggedUser(): Promise<User> {
    return this.http.get(UserProfileService.BASE);
}
}