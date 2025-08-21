import HttpClient from "../../../../framework/HttpClient/HttpClient";
import type { IHttpClient } from "../../../../framework/HttpClient/IHttpClient";
import type UserProfile from "../models/UserProfile";

export default class UserProfileService {
  private static readonly BASE = "http://localhost:8080/user";
  private static readonly PROFILE_ENDPOINT = this.BASE + "/";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new HttpClient();
  }

  getUserProfile(userName: string): Promise<UserProfile> {
      // const response = await fetch(UserProfileService.BASE + );
      return this.http.get(UserProfileService.PROFILE_ENDPOINT + userName);
  }
}