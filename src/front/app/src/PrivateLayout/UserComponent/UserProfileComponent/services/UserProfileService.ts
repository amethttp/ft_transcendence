import { ApiClient } from "../../../../ApiClient/ApiClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type UserProfile from "../models/UserProfile";

export default class UserProfileService {
  private static readonly BASE = "/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  getUserProfile(userName: string): Promise<UserProfile> {
      return this.http.get(UserProfileService.PROFILE_ENDPOINT + userName);
  }
}