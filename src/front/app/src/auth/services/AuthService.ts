import { ApiClient } from "../../ApiClient/ApiClient";
import { CookieHelper } from "../../framework/CookieHelper/CookieHelper";
import type { IHttpClient } from "../../framework/HttpClient/IHttpClient";
import type { LoginRequest } from "../models/LoginRequest";
import type { LoginResponse } from "../models/LoginResponse";

export class AuthService {
  private static readonly BASE = "/auth";
  private static readonly LOGIN_ENDPOINT = this.BASE + "/login";
  private readonly http: IHttpClient;

  constructor() {
    this.http = new ApiClient();
  }

  login(request: LoginRequest): Promise<LoginResponse> {
    return this.http.post(AuthService.LOGIN_ENDPOINT, request, {credentials: "include"});
  }

  logout() {
    // TODO: API call to remove RefreshToken correctly
    CookieHelper.delete("AccessToken");
    CookieHelper.delete("RefreshToken");
  }

}